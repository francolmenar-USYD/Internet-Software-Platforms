from . import views
from django.urls import path, include

from .views import AuthenticationView, UserServiceView

# Path for the apps
urlpatterns = [
	path('api/login/', views.login, name='login'),
	path('api/auth/', AuthenticationView.as_view()),
	path('api/get_user_detials/', views.get_user_detials),
	path('api/add_user/', views.add_user),
	path('api/myservices/', UserServiceView.as_view())
]
