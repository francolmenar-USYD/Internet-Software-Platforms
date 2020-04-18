from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


# Create your models here.

# Service Model - store all available services
class Service(models.Model):
	service_id = models.AutoField(primary_key=True)
	service_name = models.CharField(max_length=50)

# User_Service Model - store all services that belongs to each user and
# their authentication token
class User_Service(models.Model):
	user_id = models.ForeignKey(User, on_delete=models.CASCADE)
	service_id = models.ForeignKey(Service, on_delete=models.CASCADE)
	auth_token = models.CharField(max_length=255)
	expire = models.DateTimeField(default=timezone.now)
	refresh_token = models.CharField(max_length=255)
