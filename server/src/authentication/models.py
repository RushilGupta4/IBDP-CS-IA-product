"""Models that are used for all user accounts related processed"""

from uuid import uuid4

from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.contrib.auth.password_validation import get_default_password_validators
from rest_framework.exceptions import AuthenticationFailed


class UserManager(BaseUserManager):
    """User manager which manages the registration of super and normal users"""

    def create_user(self, email, password, first_name, last_name):
        """Creates a normal user"""
        self._validate_user(email, password)

        user = self.model(email=self.normalize_email(email))
        user.set_password(password)
        user.first_name = first_name
        user.last_name = last_name
        user.is_staff = False
        user.is_admin = False
        user.is_superuser = False
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, first_name, last_name):
        """Creates a superuser"""
        self._validate_user(email, password)

        user = self.model(email=self.normalize_email(email))
        user.set_password(password)
        user.first_name = first_name
        user.last_name = last_name
        user.is_staff = True
        user.is_admin = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

    @staticmethod
    def _validate_user(email, password):
        """Validates if the email and password is correct and secure"""
        if not email:
            raise ValueError("User must have an email")
        if not password:
            raise ValueError("User must have a password")

        for validator in get_default_password_validators():
            try:
                validator.validate(password)
            except Exception as error:
                raise AuthenticationFailed from error


class User(AbstractUser):
    """User model which stores appropriate fields"""

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    email = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    username = None
    created_at = models.DateTimeField(auto_now_add=True)
    is_admin = models.BooleanField()
    is_staff = models.BooleanField()
    is_superuser = models.BooleanField()

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["password", "first_name", "last_name"]


class OTP(models.Model):
    """OTP model which stores the details of an otp and links it to a user"""

    user = models.ForeignKey(User, null=False, on_delete=models.CASCADE)
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    secret = models.CharField(max_length=255)
    exp_minutes = models.IntegerField(null=False)
    done = models.BooleanField(default=False)
