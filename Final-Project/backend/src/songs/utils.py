# Utiilty functions for songs app

import requests
import json

from songs.models import Song, Album, Artist, Playlist
from user.models import Service, User_Service
from .api.serializer import SongSerializer, AlbumSerializer, ArtistSerializer, PlaylistSerializer
from songs import credentials
from rest_framework.response import Response

# Deprecate
def key_expires(now, expires_in):
	return now + expires_in

# Remove all Youtube trending songs in the database
def removeAllYoutubeTrending():
	try:
		youtube_trending = Album.objects.get(name="Trending on YouTube").pk
	except Album.DoesNotExist:
		return
	Song.objects.filter(album=youtube_trending).delete()

# Send a request to Youtube API to get music videos back
def getYoutubeMusic(access_token, chart, maxResults, pageToken=None):

	payload = {
		'access_token': access_token,
		'part': 'snippet',
		'regionCode': 'AU',
		'videoCategoryId': 10,
		'maxResults': maxResults
	}

	if chart:
		payload['chart'] = chart

	if pageToken:
		payload['pageToken'] = pageToken

	response = requests.get("https://www.googleapis.com/youtube/v3/videos", params=payload)
	return response

# Send a request to Youtube API search for music videos
def getYoutubeSearch(access_token, query, maxResults, type, pageToken=None):
	payload = {
		'access_token': access_token,
		'part': 'snippet',
		'regionCode': 'AU',
		'videoCategoryId': 10,
		'maxResults': maxResults,
		'type': type,
		'q': query
	}

	if pageToken:
		payload['pageToken'] = pageToken

	response = requests.get("https://www.googleapis.com/youtube/v3/search", params=payload)
	return response

# Send a request to Spotify API to get all saved songs foru user
def getSpotifySongsAPI(offset, limit, access_token):
	headers = {
		'Authorization': 'Bearer ' + access_token,
	}
	payload = {
		'limit': limit,
		'offset': offset
	}
	response = requests.get("https://api.spotify.com/v1/me/tracks", headers=headers, params=payload)
	return response

# Send a request to Spotify API to get all saved albums foru user
def getSpotifyAlbumAPI(offset, limit, access_token):
	headers = {
		'Authorization': 'Bearer ' + access_token,
  	}

	payload = {
		'limit': limit,
		'offset': offset
	}
	response = requests.get("https://api.spotify.com/v1/me/albums", headers=headers, params=payload)
	return response

# Send a request to Spotify API to get all saved artists foru user
def getSpotifyArtistAPI(offset, limit, access_token):
	headers = {
		'Authorization': 'Bearer ' + access_token,
	}

	payload = {
		'limit': limit,
		'offset': offset
  	}
	response = requests.get("https://api.spotify.com/v1/me/artists", headers=headers, params=payload)
	return response

# send authorization_code or refresh_token to get access token for the Spotify api
def getSpotifyAccessToken(code, refresh=False):
	client_id = credentials.SPOTIFY_CLIENT_ID
	client_secret = credentials.SPOTIFY_CLIENT_SECRET
	redirect_uri = credentials.SPOTIFY_REDIRECT_URI

	# if refresh token exists - refresh and get new token : else - send the authorization_code from callback to
	# retrieve new token
	if refresh:
		data = {
	  	'grant_type': 'refresh_token',
	  	'refresh_token': code
		}
	else:
		data = {
	  	'grant_type': 'authorization_code',
	  	'code': code,
	  	'redirect_uri': "http://localhost:3000/spotifycallback",
		}

	headers = {
		'Content-Type': 'application/x-www-form-urlencoded',
	}
	response = requests.post('https://accounts.spotify.com/api/token',
		data=data,
		auth=(client_id, client_secret),
		headers=headers)

	return response


# Create an artist and save to database
def createArtist(artist):
	store = {'name': artist['name']}
	artist_serializer = ArtistSerializer(data=store)
	# If artist can be created
	if artist_serializer.is_valid():
		obj = artist_serializer.save()
		return obj
	print(artist_serializer.errors)
	return None

# Create an album and save to database
def createAlbum(album, public=False):
	# Create new artist if not exist, otherwise get the artist id from database
	try:
	  artist = Artist.objects.get(name=album['artists'][0]['name'])
	  addUserToArtist(artist, album['user_pk'])
	  artist = artist.pk
	except Artist.DoesNotExist:
	  if len(album['artists'][0]) == 0: return None
	  artist = createArtist(album['artists'][0])
	  addUserToArtist(artist, album['user_pk'])
	  artist = artist.pk

	# Organise data and store using the serializer
	store = {
	'name': album['name'],
	'artist': artist,
	'album_cover_url': album['images'][0]['url'],
	'public': public,
	}

	album_serializer = AlbumSerializer(data=store)
	if album_serializer.is_valid():
		obj = album_serializer.save()
		return obj
	print(album_serializer.errors)
	return Album.objects.get(name=store['name'])

def addUserToAlbum(album, user_pk):
	album.users.add(user_pk)
	album.save()

def addUserToArtist(artist, user_pk):
	artist.users.add(user_pk)
	artist.save()

# Create an album and save to database
def createSong(track, service_pk, public=False):

	get_album = track['album']
	# Create new album if not exist, otherwise get the album id from database
	if get_album:
		try:
			album = Album.objects.get(name=get_album['name'])
			addUserToAlbum(album, track['user_pk'])
			album = album.pk
		except Album.DoesNotExist:
			if len(get_album['name']) == 0: return None
			track['album']['user_pk'] = track['user_pk']
			album = createAlbum(track['album'], public)
			addUserToAlbum(album, track['user_pk'])
			album = album.pk
	else:
		album = None

	# Create new artist if not exist, otherwise get the artist id from database
	try:
		artist = Artist.objects.get(name=track['artists'][0]['name'])
		addUserToArtist(artist, track['user_pk'])
		artist = artist.pk
	except Artist.DoesNotExist:
		if len(track['artists'][0]) == 0: return None
		artist = createArtist(track['artists'][0])
		addUserToArtist(artist, track['user_pk'])
		artist = artist.pk

	# Organise data and store using the serializer
	store = {
	'name': track['name'],
	'artist': artist,
	'album': album,
	'service': service_pk,
	'url': track['url'],
	'unique_id': track['id'],
	'users': [track['user_pk']],
	'public': public
	}
	print(track['name'])

	# Only add user to song if it already exists, otherwise create new song in the database
	try:
		obj = Song.objects.get(unique_id=store['unique_id'])
		obj.users.add(track['user_pk'])
		obj.save()
		return obj
	except Song.DoesNotExist:
		song_serializer = SongSerializer(data=store)

		if song_serializer.is_valid():
			obj = song_serializer.save()
			return obj

		print(song_serializer.errors)
	return None
