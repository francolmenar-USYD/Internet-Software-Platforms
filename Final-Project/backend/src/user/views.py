
from django.shortcuts import render
from django.http import HttpResponse

from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import login, authenticate, logout

from django.contrib.auth.models import User
from .models import User_Service, Service

from django.views.decorators.csrf import csrf_exempt

from rest_framework.authentication import SessionAuthentication, BasicAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated

from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.generics import ListAPIView, RetrieveAPIView
from .serializer import UserSerializer, UserServiceSerializer
# Create your views here.

class UserServiceView(ListAPIView):
  serializer_class = UserServiceSerializer
  
  
  def get_queryset(self):
    user = self.request.user
    queryset=User_Service.objects.filter(user_id=user.pk)
    return queryset

# add user to database
@csrf_exempt
@api_view(['POST'])
@permission_classes((AllowAny, ))
def add_user(request):
	data = request.data.copy()
	data['username'] = data['email']
	user = UserSerializer(data=data) # Create user serializer with request data

	# Save if data is valid
	if user.is_valid():
		user.save()
		return Response(user.data, status=200)
	else:
		return Response({"error": "ded"})

# Authenticate login
@csrf_exempt
@api_view(['POST'])
@permission_classes((AllowAny, ))
def login(request):
	data = request.data
	user = authenticate(username=data.get('email'), password=data.get('password')) # Authenticate with given data
	if user is not None:
		if user.is_active:
			# If authentication successful
			token, _ = Token.objects.get_or_create(user=user)
			response = UserSerializer(user)
			if response.is_valid:
				# Return authentication token
				resp = response.data
				resp['token'] = token.key
				return Response(resp, status=200)
	return Response({'error': 'ded'}, status=403)

# Check if token is valid
@csrf_exempt
@api_view(["GET"])
@permission_classes((IsAuthenticated, ))
def get_user_detials(request):
	response = UserSerializer(request.user)
	if response.is_valid:
		return Response(response.data, status=200)
	return Response(response.error)


class AuthenticationView(APIView):
	authentication_classes = (SessionAuthentication, BasicAuthentication)
	permission_classes = (IsAuthenticated, )

	def get(self, request, format=None):
		content = {
			'user': str(request.user),
			'auth': str(request.auth),
		}

		return Response(content)
