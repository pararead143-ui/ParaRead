from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')

    # Extra fields for settings
    notifications = models.BooleanField(default=True)
    font_size = models.CharField(max_length=10, default="medium")
    language = models.CharField(max_length=10, default="en")
