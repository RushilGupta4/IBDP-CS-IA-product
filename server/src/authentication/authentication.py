"""Manages and Defines all user authentication"""

from datetime import timedelta
from os import environ

from jwt import decode
from jwt.exceptions import ExpiredSignatureError, InvalidSignatureError, ImmatureSignatureError, DecodeError
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.authentication import BaseAuthentication

from .models import User

ALGORITHM = "HS256"
SECRET = environ["jwtSecret"]
EXPIRATION_TIME = timedelta(days=4)

OTP_SECRET = environ["otpSecret"]
OTP_VALIDITY = 5

JWT_EXCEPTIONS = (ExpiredSignatureError, InvalidSignatureError, ImmatureSignatureError, DecodeError)
HTTP_SECURE = False


class UserAuthentication(BaseAuthentication):
    """
    An authentication plugin that authenticates requests through a JSON web
    token provided in a request header.
    """
    www_authenticate_realm = 'api'
    media_type = 'application/json'

    def authenticate(self, request):
        try:
            payload = decode(token := request.COOKIES.get("jwt"), SECRET, algorithms=[ALGORITHM])
        except JWT_EXCEPTIONS as exceptiom:
            raise AuthenticationFailed from exceptiom

        if not User.objects.filter(id=payload["id"]).exists():
            raise AuthenticationFailed

        return User.objects.get(id=payload["id"]), token