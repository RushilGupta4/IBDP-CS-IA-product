"""Models that are used for all user accounts related processed"""

from uuid import uuid4 as _uuid4

from django.db import models as _models
from django.contrib.auth.models import AbstractUser as _AbstractUser, BaseUserManager as _BaseUserManager
from django.contrib.auth.password_validation import get_default_password_validators as _get_default_password_validators
from rest_framework.exceptions import AuthenticationFailed as _AuthenticationFailed


class UserManager(_BaseUserManager):
    """User manager which manages the registration of super and normal users"""
    def create_user(self, email, password, first_name, last_name, account_type):
        """Creates a normal user"""
        self._validate_user(email, password)

        user = self.model(
            email=self.normalize_email(email)
        )
        user.set_password(password)
        user.first_name = first_name
        user.last_name = last_name
        user.account_type = account_type
        user.is_admin = False
        user.is_superuser = False
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, first_name, last_name, account_type):
        """Creates a superuser"""
        self._validate_user(email, password)

        user = self.model(
            email=self.normalize_email(email)
        )
        user.set_password(password)
        user.first_name = first_name
        user.last_name = last_name
        user.account_type = account_type
        user.is_admin = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

    @staticmethod
    def _validate_user(email, password):
        """Validates if the supplied email and passwords are correct and secure"""
        if not email:
            raise ValueError("User must have an email")
        if not password:
            raise ValueError("User must have a password")

        for validator in _get_default_password_validators():
            try:
                validator.validate(password)
            except Exception as error:
                raise _AuthenticationFailed from error


# User Authentication Model
class User(_AbstractUser):
    """User model which stores appropriate fields"""

    id = _models.UUIDField(primary_key=True, default=_uuid4, editable=False)
    email = _models.CharField(max_length=255, unique=True)
    password = _models.CharField(max_length=255)
    first_name = _models.CharField(max_length=255)
    last_name = _models.CharField(max_length=255)
    username = None
    created_at = _models.DateTimeField(verbose_name="created at", auto_now_add=True)
    role = _models.CharField(max_length=64, default="free")
    is_admin = _models.BooleanField()
    is_superuser = _models.BooleanField()

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["password", "first_name", "last_name", "account_type"]


class LeaveApplication(_models.Model):
    APPROVED = "approved"
    REJECTED = "rejected"

    id = _models.UUIDField(primary_key=True, default=_uuid4, editable=False, null=False)
    employee = _models.ForeignKey(User, on_delete=_models.CASCADE, null=False)
    created_at = _models.DateTimeField(verbose_name="created at", auto_now_add=True, null=False)
    start_date = _models.DateTimeField(verbose_name="start date", null=False)
    end_date = _models.DateTimeField(verbose_name="end date", null=False)
    reason = _models.CharField(max_length=512, null=False)
    completed = _models.BooleanField(null=False)
    decision = _models.CharField(max_length=16, null=False)
    decision_date = _models.DateTimeField(verbose_name="decision date", null=False)


# OTP Model
class OTP(_models.Model):
    """OTP model which stores the details of an otp and links it to a user"""
    user = _models.ForeignKey(User, null=False, on_delete=_models.CASCADE)
    id = _models.UUIDField(primary_key=True, default=_uuid4, editable=False)
    created_at = _models.DateTimeField(auto_now_add=True)
    secret = _models.CharField(max_length=255)
    exp_minutes = _models.IntegerField(null=False)
    done = _models.BooleanField(default=False)
