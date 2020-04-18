from django.test import TestCase

from songs.api.serializer import SongSerializer
from songs.utils import *

from django.contrib.auth.models import User
from user.models import Service, User_Service
# Create your tests here.
def application(env, start_response):
    start_response('200 OK', [('Content-Type','text/html')])
    return "Hello World"

class LoginTest(TestCase):

	def test_register(self):
		data = {
			'username': 'lil@rex.com',
			'first_name': 'lil',
			'last_name': 'rex',
			'email': 'lil@rex.com',
			'password': '1234'
		}
		response = self.client.post('/user/api/add_user/', data=data, follow=True)
		self.assertEqual(response.status_code, 200)
		user = User.objects.all()
		self.assertEqual(user[0].email, 'lil@rex.com')
		self.assertEqual(user[0].first_name, 'lil')
		# test encrypted password
		self.assertNotEqual(user[0].password, '1234')
		return

	def test_login(self):
		self.test_register()
		response = self.client.post('/user/api/login/', 
			data= {'email' : 'lil@rex.com', 'password': '1234'}, follow=True)
		self.assertEqual(response.status_code, 200)
		self.assertNotEqual(response, None)
		return response.data['token']

	def test_use_token(self):
		token = self.test_login()
		auth_headers = {
    		'HTTP_AUTHORIZATION': 'Token ' + token,
		}
		# self.assertEqual(token, 1)

		# nice spelling
		response = self.client.get('/user/api/get_user_detials/', 
			**auth_headers)
		user = response.data
		self.assertEqual(response.status_code, 200)
		self.assertEqual(user['email'], 'lil@rex.com')
		self.assertEqual(user['first_name'], 'lil')

class PlaylistTest(TestCase):
	def register(self):
		data = {
			'username': 'lil@rex.com',
			'first_name': 'lil',
			'last_name': 'rex',
			'email': 'lil@rex.com',
			'password': '1234'
		}
		self.client.post('/user/api/add_user/', data=data, follow=True)
		return

	def get_user(self):
		response = self.client.post('/user/api/login/', 
			data= {'email' : 'lil@rex.com', 'password': '1234'}, follow=True)
		return response.data['token']

	def setup(self):
		service,_ = Service.objects.get_or_create(service_id=3,service_name="Spotify")

		song = {
        "id": 615,
        "name": "Stranger",
        "artist": None,
        "album": None,
        "service": service,
        "url": "https://open.spotify.com/track/0FifUO9aaibYBaNDNo5rho",
        "unique_id": "0FifUO9aaibYBaNDNo5rho",
        "s3_url": "https://s3.ap-southeast-2.amazonaws.com/bird-mp3/615.mp3",
        "public": False
    	}
		song,_ = Song.objects.get_or_create(**song)
		if len(User.objects.all()) == 0:
			self.register()

		# song2 = {
		# "id": 616,
		# "name": "Renegades",
		# "artist": None,
		# "album": None,
		# "service": 3,
		# "url": "https://open.spotify.com/track/2f8ay8h3XgAAAj8LuyMe3k",
		# "unique_id": "2f8ay8h3XgAAAj8LuyMe3k",
		# "s3_url": "https://s3.ap-southeast-2.amazonaws.com/bird-mp3/616.mp3",
		# "public": False
		# }
  #   	song2 = Song.objects.create(**song2)
  #   	return

	def test_create_playlist(self):
		self.setup()
		data = {'name': 'rockstar'}
		token = self.get_user()
		auth_headers = {
    		'HTTP_AUTHORIZATION': 'Token ' + token,
		}
		response = self.client.post('/api/add_playlist/', data=data, **auth_headers)
		playlist = response.json()
		self.assertEqual(playlist['name'], 'rockstar')
		self.assertEqual(Playlist.objects.all()[0].name, 'rockstar')
		

class SongTest(TestCase):
	def get_user(self):
		data = {
			'username': 'lil@rex.com',
			'first_name': 'lil',
			'last_name': 'rex',
			'email': 'lil@rex.com',
			'password': '1234'
		}
		self.client.post('/user/api/add_user/', data=data, follow=True)
		response = self.client.post('/user/api/login/', 
			data= {'email' : 'lil@rex.com', 'password': '1234'}, follow=True)
		return response.data['token']

	def setup(self):
		service = Service.objects.create(service_id=3,service_name="Spotify")
		service.save()
		song = {
        "id": 615,
        "name": "Stranger",
        "artist": None,
        "album": None,
        "service": service,
        "url": "https://open.spotify.com/track/0FifUO9aaibYBaNDNo5rho",
        "unique_id": "0FifUO9aaibYBaNDNo5rho",
        "s3_url": "https://s3.ap-southeast-2.amazonaws.com/bird-mp3/615.mp3",
        "public": False
    	}
		song = Song.objects.create(**song)
		return

	def test_get_a_song_test(self):
		self.setup()
		token = self.get_user()
		auth_headers = {
    		'HTTP_AUTHORIZATION': 'Token ' + token,
		}
		# self.assertEqual(token, 1)
		response = self.client.get('/api/songs/615/', 
			**auth_headers)
		self.assertEqual(response.data['name'], 'Stranger')