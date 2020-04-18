# Django Rest Framework Serializer - serialize data and store them into our database

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Service, User_Service

# Serializer for User
class UserSerializer(serializers.ModelSerializer):
	password = serializers.CharField(write_only=True)
	class Meta:
		model = User
		fields = ("id", "username", "first_name", "last_name", "email", "date_joined", "is_staff", "password")

	def create(self, validated_data):
		# Create user then set password and save to database
		user = super(UserSerializer, self).create(validated_data)
		user.set_password(validated_data['password'])
		user.save()
		return user

# Serializer for User Service
class UserServiceSerializer(serializers.ModelSerializer):
	service_name = serializers.CharField(source='service_id.service_name', required=False)
	class Meta:
		model = User_Service
		
		fields = ("user_id", "service_id", "auth_token", "expire", "refresh_token", "service_name")


	def create(self, validated_data):
		# If user already has the service, return service
		try:
		    service = User_Service.objects.get(user_id=validated_data.get("user_id"), service_id=validated_data.get("service_id"))
		except User_Service.DoesNotExist:
		    service = None

		# Else add service and store the new token for the service
		if not service:
			service = User_Service.objects.create(**validated_data)
		else:
			service.auth_token = validated_data.get("auth_token")
			service.expire = validated_data.get('expire')
			service.refresh_token = validated_data.get("refresh_token")
			service.save()

		return service
