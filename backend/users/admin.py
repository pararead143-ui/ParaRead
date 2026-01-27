
# Register your models here.
# users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User  # Import from the users app, NOT materials

class UserAdmin(BaseUserAdmin):
    list_display = ("id", "email", "username", "is_staff", "is_superuser", "date_joined")
    list_filter = ("is_staff", "is_superuser", "is_active")
    search_fields = ("email", "username")
    ordering = ("id",)

admin.site.register(User, UserAdmin)
