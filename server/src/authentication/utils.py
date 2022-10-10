"""Utils used by the accounts views"""

from datetime import datetime, timedelta
from threading import Thread
from os import environ
from base64 import b64encode as _b64encode

import jwt
from jwt import encode
from pytz import UTC
from pyotp import random_base32, TOTP
from rest_framework.exceptions import ValidationError, AuthenticationFailed
from django.contrib.auth.password_validation import \
    get_default_password_validators
from smtplib import SMTP as _SMTP
from urllib.parse import quote as _quote, urlencode as _urlencode
from email.mime.multipart import MIMEMultipart as _MIMEMultipart
from email.mime.text import MIMEText as _MIMEText
from lxml.html import fromstring as _html_fromstring
from requests import post as _post

from .models import OTP
from .authentication import (
    OTP_VALIDITY as _OTP_VALIDITY,
    OTP_SECRET as _OTP_SECRET,
    ALGORITHM as _ALGORITHM,
    HTTP_SECURE as _HTTP_SECURE,
)


class _EmailUtils:
    _GOOGLE_ACCOUNTS_BASE_URL = 'https://accounts.google.com'
    _REDIRECT_URI = "https://developers.google.com/oauthplayground"

    _FROM_EMAIL = environ.get("emailAddress")
    _GOOGLE_CLIENT_ID = environ.get("emailClientId")
    _GOOGLE_CLIENT_SECRET = environ.get("emailClientSecret")
    _GOOGLE_REFRESH_TOKEN = environ.get("emailRefreshToken")

    def send_mail(self, to, subject, body):
        thread = Thread(target=self._send_mail, args=(to, subject, body))
        thread.start()

    def _send_mail(self, to, subject, body):
        access_token, expires_in = self._refresh_authorization()
        auth_string = self._generate_oauth2_string(
            self._FROM_EMAIL,
            access_token,
            as_base64=True
        )
        body = body.replace("\n", "<br/>")

        msg = _MIMEMultipart('related')
        msg['Subject'] = subject
        msg['From'] = self._FROM_EMAIL
        msg['To'] = to
        msg.preamble = 'This is a multi-part message in MIME format.'
        msg_alternative = _MIMEMultipart('alternative')
        msg.attach(msg_alternative)
        part_text = _MIMEText(
            _html_fromstring(body).text_content().encode('utf-8'),
            'plain',
            _charset='utf-8'
        )
        part_html = _MIMEText(body.encode('utf-8'), 'html', _charset='utf-8')
        msg_alternative.attach(part_text)
        msg_alternative.attach(part_html)

        server = _SMTP('smtp.gmail.com:587')
        server.ehlo(self._GOOGLE_CLIENT_ID)
        server.starttls()
        server.docmd('AUTH', 'XOAUTH2 ' + auth_string)
        server.sendmail(self._FROM_EMAIL, to, msg.as_string())
        server.quit()

    def _refresh_authorization(self):
        params = {
            'client_id': self._GOOGLE_CLIENT_ID,
            'client_secret': self._GOOGLE_CLIENT_SECRET,
            'refresh_token': self._GOOGLE_REFRESH_TOKEN,
            'grant_type': 'refresh_token',
        }
        request_url = f"{self._GOOGLE_ACCOUNTS_BASE_URL}/o/oauth2/token"
        response = _post(request_url, params=_urlencode(params))
        response = response.json()
        return response['access_token'], response['expires_in']

    @staticmethod
    def _generate_oauth2_string(username, access_token, as_base64=False):
        auth_string = 'user=%s\1auth=Bearer %s\1\1' % (username, access_token)
        if not as_base64:
            return as_base64
        return _b64encode(auth_string.encode('ascii')).decode('ascii')

    @staticmethod
    def _url_format_params(params):
        param_fragments = []
        for param in sorted(params.items(), key=lambda x: x[0]):
            param_fragments.append(
                '%s=%s' % (param[0], _quote(param[1], safe='~-._'))
            )
        return '&'.join(param_fragments)


class Util:
    """Util functions"""
    @staticmethod
    def send_otp_email(name, otp, email):
        """Send an email which proved the OTP for a user to login"""
        data = {
            "subject": "Email Authentication",
            "body": f"Hi {name},\n\nPlease use following OTP to login: {otp}"
                    f"\n\n\nDo not reply to this email directly. "
                    f"You are receiving this email because there "
                    f"was a login attempt from a new browser or device. "
                    f"If you did not make this request, you are "
                    f"strongly advised to change your password.",
            "to": email,
        }
        EmailUtils.send_mail(**data)

    @staticmethod
    def validate_passwords(password, re_password):
        """Checks if a pair of password and re_password is secure"""
        if password != re_password:
            raise ValidationError("Passwords do not match")

        for validator in get_default_password_validators():
            try:
                validator.validate(password=password)
            except Exception as error:
                raise ValidationError from error

    @staticmethod
    def set_jwt(response, user_id, exp_time, secret, algorithm):
        """Helper function that sets a jwt authentication token in a cookie"""
        exp_time = datetime.utcnow() + exp_time

        payload = {
            "id": user_id,
            "exp": exp_time,
            "iat": datetime.utcnow(),
        }
        token = encode(payload, secret, algorithm=algorithm)

        return Util.set_http_cookie(
            response,
            key="jwt",
            value=token,
            expires=exp_time
        )

    @staticmethod
    def set_http_cookie(response, key, value, expires):
        """Sets a http cookie """
        response.set_cookie(
            key=key,
            value=value,
            expires=expires,
            httponly=True,
            samesite="None",
            secure=_HTTP_SECURE,
        )
        return response

    @staticmethod
    def delete_http_cookie(response, key):
        """Delete a http cookie """
        response.set_cookie(
            key=key,
            httponly=True,
            samesite="None",
            secure=_HTTP_SECURE,
            max_age=0,
            path='/',
            domain=None,
            expires='Thu, 01-Jan-1970 00:00:00 GMT'
        )
        return response

    @staticmethod
    def create_otp(user):
        """Create an OTP by receiving the user Model"""
        otp_data = {
            "user": user,
            "exp_minutes": _OTP_VALIDITY,
            "secret": random_base32(),
        }
        otp = OTP(**otp_data)
        otp.save()

        payload = {
            "id": otp.id.urn[9:],
            "exp": otp.created_at + timedelta(minutes=otp.exp_minutes),
            "iat": otp.created_at,
        }
        token = jwt.encode(payload, _OTP_SECRET, algorithm=_ALGORITHM)

        return TOTP(otp.secret).now(), token

    @staticmethod
    def verify_otp(request):
        """Verifies if an OTP is valid"""
        try:
            otp_code = request.data["otp"]

            try:
                otp_id = jwt.decode(
                    request.COOKIES.get("login_token"),
                    _OTP_SECRET,
                    algorithms=[_ALGORITHM]
                )["id"]
            except Exception as error:
                raise AuthenticationFailed from error

            if not OTP.objects.filter(id=otp_id).exists():
                raise AuthenticationFailed

            otp = OTP.objects.get(id=otp_id)
            validity = timedelta(minutes=otp.exp_minutes)

            if (
                    (otp.created_at + validity).replace(tzinfo=UTC)
                    < datetime.utcnow().replace(tzinfo=UTC) or otp.done
            ):
                raise ValidationError("OTP Expired, Please Try Again")

            secret = otp.secret
            if not TOTP(secret).verify(otp_code, valid_window=10):
                raise ValidationError

            otp.done = True
            otp.save()

            return otp.user

        except Exception as error:
            raise AuthenticationFailed from error

    @staticmethod
    def send_otp(user, email, response):
        """Creates and sends an OTP to the user's email"""
        otp_code, token = Util.create_otp(user)
        Util.send_otp_email(
            f"{user.first_name} {user.last_name}",
            otp_code,
            email
        )

        response = Util.set_http_cookie(
            response=response,
            key="login_token",
            value=token,
            expires=datetime.utcnow() + timedelta(minutes=_OTP_VALIDITY)
        )
        return response


EmailUtils = _EmailUtils()
