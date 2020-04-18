from django.contrib import admin

# Register your models here.
from .models import Service, User_Service

admin.site.register(User_Service)
admin.site.register(Service)