"""Handles all authentication based requests"""

from datetime import datetime, timedelta

import jwt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from rest_framework.permissions import AllowAny
from django.core.validators import validate_email
from django.contrib.auth.models import update_last_login
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import smart_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

from .models import User, OTP
from .authentication import (
    EXPIRATION_TIME as _EXPIRATION_TIME,
    SECRET as _SECRET,
    ALGORITHM as _ALGORITHM,
    OTP_SECRET as _OTP_SECRET,
    HTTP_SECURE as _HTTP_SECURE,
    JWT_EXCEPTIONS as _JWT_EXCEPTIONS,
)
from .utils import Util, EmailUtils


class RegisterView(APIView):
    """API View for users to initiate registration"""

    permission_classes = (AllowAny,)
    authentication_classes = []
    prefix = "verify-email"

    def post(self, request):
        """POST Request"""
        try:
            email = request.data["email"]
        except KeyError as exception:
            raise ValidationError from exception

        validate_email(email)
        if User.objects.filter(email=email).exists():
            raise ValidationError("Email already registered")

        payload = {
            "email": email,
            "exp": datetime.utcnow() + timedelta(days=2),
            "iat": datetime.utcnow(),
        }
        token = jwt.encode(payload, _SECRET, algorithm=_ALGORITHM)

        url = (
            f"http{'s' if _HTTP_SECURE else ''}://"
            f"{settings.NEXT_DOMAIN}/"
            f"{self.prefix}?token={token}"
        )

        email_data = {
            "subject": "Account Registration",
            "body": f"Hi,\n\n" f"Please use the link below to register:\n{url}",
            "to": email,
        }

        EmailUtils.send_mail(**email_data)

        return Response({"message": "An email has been sent to the given email"})


class ValidateRegisterView(APIView):
    """API View for users to be able to register from the link they got"""

    permission_classes = (AllowAny,)
    authentication_classes = []

    @staticmethod
    def post(request):
        """POST Request"""
        user_data = {}
        try:
            email = jwt.decode(
                request.data.pop("token"), _SECRET, algorithms=[_ALGORITHM]
            )["email"]

            if User.objects.filter(email=email).exists():
                raise ValidationError

            validate_email(email)
            Util.validate_passwords(
                request.data["password"], request.data.pop("rePassword")
            )

            user_data["email"] = email
            user_data["password"] = request.data["password"]
            user_data["first_name"] = request.data["firstName"]
            user_data["last_name"] = request.data["lastName"]

        except (KeyError, *_JWT_EXCEPTIONS) as exception:
            raise ValidationError from exception

        user = User.objects.create_user(**user_data)

        response = Response({"message": "Registered"})
        response = Util.set_jwt(
            response, user_data["email"], _EXPIRATION_TIME, _SECRET, _ALGORITHM
        )

        return response


class ForgotPassword(APIView):
    """API View for initiating a forgot password request"""

    permission_classes = (AllowAny,)
    authentication_classes = []

    prefix = "reset-password"
    email_subject = "Password Reset Request"
    email_body = (
        "Hi {name}," "\n\nPlease use the link below to reset your password:\n{url}"
    )

    def post(self, request):
        """POST Request"""
        try:
            email = request.data["email"]
        except KeyError as exception:
            raise ValidationError from exception

        if not User.objects.filter(email=email).exists():
            raise ValidationError

        user = User.objects.get(email=email)
        uuid64 = urlsafe_base64_encode(smart_bytes(user.email))
        token = default_token_generator.make_token(user)

        url = (
            f"http{'s' if _HTTP_SECURE else ''}://"
            f"{settings.NEXT_DOMAIN}/"
            f"{self.prefix}?token={token}&id={uuid64}"
        )

        email_data = {
            "subject": self.email_subject,
            "body": self.email_body.format(
                name=f"{user.first_name} {user.last_name}", url=url
            ),
            "to": email,
        }

        EmailUtils.send_mail(**email_data)

        return Response({"message": "Email Sent"})


class ResetPassword(APIView):
    """API View to reset user password"""

    permission_classes = (AllowAny,)
    authentication_classes = []

    @staticmethod
    def post(request):
        """POST Request"""
        try:
            password = request.data["password"]
            re_password = request.data["rePassword"]
            token = request.data["token"]
            user_email = force_str(urlsafe_base64_decode(request.data["id"]))
            if not User.objects.filter(email=user_email).exists():
                raise AuthenticationFailed
                
            user = User.objects.get(email=user_email)

            if not default_token_generator.check_token(user, token):
                raise AuthenticationFailed

            Util.validate_passwords(password, re_password)

        except Exception as exception:
            raise AuthenticationFailed from exception

        user.set_password(password)
        user.save()

        return Response({"message": "Password Reset Successfully"})


class LoginView(APIView):
    """API View for users to login"""

    permission_classes = (AllowAny,)
    authentication_classes = []

    @staticmethod
    def post(request):
        """POST Request"""
        response = Response({"message": "Email Sent"})

        try:
            email = request.data["email"]
            password = request.data["password"]
        except KeyError as exception:
            raise AuthenticationFailed from exception

        if not User.objects.filter(email=email).exists():
            raise AuthenticationFailed("User not registered")

        user = User.objects.get(email=email)
        if not user.check_password(password):
            raise AuthenticationFailed("Incorrect Credentials")

        return Util.send_otp(user, email, response)


class ResendOTP(APIView):
    """API View for users to get otp again"""

    permission_classes = (AllowAny,)
    authentication_classes = []

    @staticmethod
    def post(request):
        """POST Request"""
        response = Response({"message": "Email Sent"})

        try:
            otp_id = jwt.decode(
                request.COOKIES.get("login_token"),
                _OTP_SECRET,
                algorithms=(_ALGORITHM,),
            )["id"]
        except (KeyError, *_JWT_EXCEPTIONS) as exception:
            raise AuthenticationFailed from exception

        if not OTP.objects.filter(id=otp_id).exists():
            raise AuthenticationFailed

        otp = OTP.objects.get(id=otp_id)
        if otp.done:
            raise AuthenticationFailed

        user = otp.user
        email = user.email

        return Util.send_otp(user, email, response)


class ValidateLoginView(APIView):
    """API View for users to validate their login token"""

    permission_classes = (AllowAny,)
    authentication_classes = []

    @staticmethod
    def post(request):
        """POST Request"""
        user = Util.verify_otp(request)
        update_last_login(None, user)

        response = Response({"message": "Logged In"})
        response = Util.set_jwt(
            response, user.email, _EXPIRATION_TIME, _SECRET, _ALGORITHM
        )
        response = Util.delete_http_cookie(response, "login_token")

        return response


class UserView(APIView):
    """API View fto verify their jwt authentication token"""

    permission_classes = (AllowAny,)
    authentication_classes = []

    @staticmethod
    def get(request):
        """GET Request for users to get their account details"""
        try:
            payload = jwt.decode(
                request.COOKIES.get("jwt"), _SECRET, algorithms=(_ALGORITHM,)
            )
        except _JWT_EXCEPTIONS as exception:
            raise AuthenticationFailed from exception

        if not User.objects.filter(email=payload["id"]).exists():
            raise AuthenticationFailed

        user = User.objects.get(email=payload["id"]).__dict__
        user_data = {
            "email": user["email"],
            "firstName": user["first_name"],
            "lastName": user["last_name"],
            "isAdmin": user["is_admin"],
            "isStaff": user["is_staff"],
        }

        return Response(user_data)


class LogoutView(APIView):
    """API View for users to logout. Essentially just deletes the jwt cookie"""

    permission_classes = (AllowAny,)
    authentication_classes = []

    @staticmethod
    def post(request):
        """Removes jwt cookie from client"""
        response = Response({"message": "Logged Out"})
        response = Util.delete_http_cookie(response, "jwt")
        return response


METHODS_BY_PATHS = {
    "register": RegisterView.as_view(),
    "validate-register": ValidateRegisterView.as_view(),
    "login": LoginView.as_view(),
    "resend-otp": ResendOTP.as_view(),
    "validate-login": ValidateLoginView.as_view(),
    "user": UserView.as_view(),
    "logout": LogoutView.as_view(),
    "forgot-password": ForgotPassword.as_view(),
    "reset-password": ResetPassword.as_view(),
}
