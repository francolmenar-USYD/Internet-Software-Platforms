from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import permission_classes, api_view
from rest_framework.filters import SearchFilter

from django.utils import timezone
from datetime import datetime

from songs.models import Song, Album, Artist, Playlist
from user.models import Service, User_Service
from .serializer import SongSerializer, AlbumSerializer, ArtistSerializer, PlaylistSerializer
from user.serializer import UserServiceSerializer
from django.db.models import Q


import requests
import json
import base64
import os
from subprocess import call

import google.oauth2.credentials
import google_auth_oauthlib.flow
from googleapiclient.discovery import build

import boto3

from django.http import HttpResponseRedirect, HttpResponse, JsonResponse, StreamingHttpResponse
from songs import credentials

from songs.utils import *


CLIENT_ID = "342b8a7af638944906dcdb46f9d56d98"

# Returns a list of Songs available to users given their services
class SongServiceView(ListAPIView):
  serializer_class = SongSerializer

  def get_queryset(self):
    user = self.request.user
    services = User_Service.objects.filter(user_id=user).values("service_id")
    print(services)
    return Song.objects.filter(service__in=services)

# Returns a list of Songs available to the user
class SongListView(ListAPIView):
  serializer_class = SongSerializer
  filter_backends = (SearchFilter,)
  search_fields = ('name', 'album__name')

  def get_queryset(self):
    # Get Authenticated user
    user = self.request.user.pk
    # Get all songs related to user + public ones
    queryset = Song.objects.filter(Q(users__in=[user]) | Q(public=True))

    # Can use keywords to search for songs
    name_search = self.request.query_params.get('name', None)
    if name_search is not None:
      queryset = queryset.filter(name__icontains=name_search)

    album_search = self.request.query_params.get('album', None)
    if album_search is not None:
      queryset = queryset.filter(album__name__icontains=album_search)

    return queryset

# Get a particular song
class SongDetailView(RetrieveAPIView):
  queryset = Song.objects.all()
  serializer_class = SongSerializer

# Get a list of albums available to the user
class AlbumListView(ListAPIView):
  serializer_class = AlbumSerializer
  filter_backends = (SearchFilter,)
  search_fields = ('name', 'artist__name')

  def get_queryset(self):
    queryset = Album.objects.filter(Q(users__in=[self.request.user.pk]) | Q(public=True))
    name_search = self.request.query_params.get('name', None)
    if name_search is not None:
      queryset = queryset.filter(name__icontains=name_search)

    artist_search = self.request.query_params.get('artist', None)
    if artist_search is not None:
      queryset = queryset.filter(artist__name__icontains=artist_search)

    return queryset

# Get a particular album
class AlbumDetailView(RetrieveAPIView):
  queryset = Album.objects.all()
  serializer_class = AlbumSerializer

# Get all songs belong to a particular album
class AlbumSongsView(ListAPIView):
  serializer_class = SongSerializer
  def get_queryset(self):
    album_id = self.kwargs.get('album')
    queryset = Song.objects.filter(album=album_id)
    return queryset

# Get a list of artists available to the user
class ArtistListView(ListAPIView):
  def get_queryset(self):
    queryset = Artist.objects.filter(Q(users__in=[self.request.user.pk]) | Q(public=True))
    return queryset
  serializer_class = ArtistSerializer
  filter_backends = (SearchFilter,)
  search_fields = ('name', )

# Get a particular artist
class ArtistDetailView(RetrieveAPIView):
  queryset = Artist.objects.all()
  serializer_class = ArtistSerializer

# Get all songs belong to a particular artist
class ArtistSongsView(ListAPIView):
  serializer_class = SongSerializer
  def get_queryset(self):
    artist_id = self.kwargs.get('artist')
    queryset = Song.objects.filter(artist=artist_id)
    return queryset

# Get all playlists
class PlaylistListView(ListAPIView):
  serializer_class = PlaylistSerializer
  filter_backends = (SearchFilter,)
  search_fields = ('name', 'user__username')

  def get_queryset(self):
    queryset = Playlist.objects.all()
    name_search = self.request.query_params.get('name', None)
    if name_search is not None:
      queryset = queryset.filter(name__icontains=name_search)

    user_search = self.request.query_params.get('username', None)
    if user_search is not None:
      queryset = queryset.filter(user__username__icontains=user_search)

    return queryset

# Get all songs from a particular playlist
class PlaylistDetailedView(ListAPIView):
  serializer_class = SongSerializer
  def get_queryset(self):
    playlist_id = self.kwargs.get('pk')
    pl = Playlist.objects.get(pk=playlist_id)
    songs = pl.songs.all()
    songs_list = []
    for song in songs:
      songs_list.append(song.pk)
    queryset = Song.objects.filter(pk__in=songs_list)
    return queryset


# Get all playlists belng to the user
class MyPlaylistView(ListAPIView):
  serializer_class = PlaylistSerializer

  def get_queryset(self):
    user = self.request.user
    print(user)
    return Playlist.objects.filter(user=user)


# API to Create playlist
@api_view(['POST'])
@permission_classes((IsAuthenticated, ))
def createPlaylist(request):

  # prepare serialized data from request
  data = {
  'name': request.data.get("name"),
  'user': request.user.pk,
  }
  playlist_serializer = PlaylistSerializer(data=data)
  # Save playlist if valid
  if playlist_serializer.is_valid():
    playlist_serializer.save()
  else:
    print(playlist_serializer.errors)

  return JsonResponse(data, json_dumps_params={'indent': 2})

# API - Add songs to playlist
@api_view(['POST'])
@permission_classes((IsAuthenticated, ))
def addToPlaylist(request):
  # Error if playlist does not exists
  try:
    playlist = Playlist.objects.get(id=request.data.get('playlist'), user=request.user.pk)
  except Playlist.DoesNotExist:
    return HttpResponse("Unsuccessful", status=301)
  songs_to_add = request.data.get('songs')
  # Add all songs given to playlist
  for song_id in songs_to_add:
    try:
      song = Song.objects.get(id=song_id)
      playlist.songs.add(song)
    except Song.DoesNotExist:
      return HttpResponse(songs_to_add)

  return HttpResponse("OK")

# API - Delete songs from playlist
@api_view(['POST'])
@permission_classes((IsAuthenticated, ))
def deleteFromPlaylist(request):
  # Error if playlist does not exists
  try:
    playlist = Playlist.objects.get(id=request.data.get('playlist'), user=request.user.pk)
  except Playlist.DoesNotExist:
    return HttpResponse("Unsuccessful", status=301)
  songs_to_delete = request.data.get('songs')
  # remove all songs given from playlist
  for song_id in songs_to_delete:
    song = Song.objects.get(id=song_id)
    playlist.songs.remove(song)

  return HttpResponse("OK")

# API - authenticate user with spotify
@api_view(['GET'])
@permission_classes((IsAuthenticated, ))
def authSpotify(request):

  # Get all credentials and the authorized scope
  client_id = credentials.SPOTIFY_CLIENT_ID
  redirect_uri = credentials.SPOTIFY_REDIRECT_URI
  scopes = 'user-read-playback-state user-modify-playback-state user-read-private user-read-email user-library-read streaming user-read-birthdate';
  # Redirect to spotify authentication page
  return JsonResponse({"redirect_url" :   'https://accounts.spotify.com/authorize' +
  '?response_type=code' +
  '&client_id=' + client_id +
  '&scope=' + scopes +
  '&redirect_uri=' + "http://localhost:3000/spotifycallback"})
  return HttpResponseRedirect('https://accounts.spotify.com/authorize' +
  '?response_type=code' +
  '&client_id=' + client_id +
  '&scope=' + scopes +
  '&redirect_uri=' + redirect_uri)

# Receive callback from spotify and add service to user
@api_view(['GET'])
@permission_classes((IsAuthenticated, ))
def callbackSpotify(request):
  code = str(request.GET.get('code'))
  # Send information from spotify to retrieve the access token to the API
  response = getSpotifyAccessToken(code)
  data = response.json()

  # Add the service and access_token to the user in the database
  service = {
    'user_id': request.user.pk,
    'service_id': Service.objects.get(service_name="Spotify").pk,
    'auth_token': data.get("access_token"),
    'expire': timezone.now() + timezone.timedelta(seconds=data.get("expires_in")),
    'refresh_token': data.get("refresh_token")
  }
  userservice = UserServiceSerializer(data=service)
  if userservice.is_valid():
    userservice.save()
  else:
    print(userservice.errors)
  return HttpResponse(response)

# API - Obtain the spotify token for the authenticated user
@api_view(['GET'])
@permission_classes((IsAuthenticated, ))
def obtainSpotifyToken(request):
  spotify = Service.objects.get(service_name="Spotify").pk

  # Get token if exists - error if not
  try:
    user_service = User_Service.objects.get(service_id=spotify, user_id=request.user.pk)
  except User_Service.DoesNotExist:
    return HttpResponse("User does not have this service")

  # If token has expired - renew using refresh token : else return token
  if timezone.now() < user_service.expire:
    return JsonResponse( { 'access_token': user_service.auth_token } )
  else:
    response = getSpotifyAccessToken(user_service.refresh_token, True)
    data = response.json()

    # update new token and its new expiry date
    service = {
      'user_id': request.user.pk,
      'service_id': Service.objects.get(service_name="Spotify").pk,
      'auth_token': data.get("access_token"),
      'expire': timezone.now() + timezone.timedelta(seconds=data.get("expires_in")),
      'refresh_token': user_service.refresh_token
    }
    userservice = UserServiceSerializer(data=service)
    if userservice.is_valid():
      userservice.save()
    else:
      print(userservice.errors)

    return JsonResponse( {'access_token': data.get("access_token")} )

# Get saved spotify albums from the API and store them in the database
@api_view(['GET'])
@permission_classes((IsAuthenticated, ))
def getSpotifySavedAlbums(request):
  # Obtain the spotify access Token
  access_token = json.loads(obtainSpotifyToken(request._request).content.decode())['access_token']

  offset = 0
  limit = 50
  response = getSpotifyAlbumAPI(offset, limit, access_token)

  data = json.loads(response.text)

  total = data['total']
  albums = data['items']
  # Keep sending requests to retrieve albums until all is retrieved
  while (offset + limit) < total:
    offset += limit
    response = getSpotifyAlbumAPI(offset, limit, access_token)
    data = json.loads(response.text)
    albums += data['items']

  # Add each album to the database if not exists : else - add user to album
  for album in albums:
    album = album['album']
    album['user_pk'] = request.user.pk
    obj = createAlbum(album)
    addUserToAlbum(obj, album['user_pk'])

  return JsonResponse(json.loads(response.text), json_dumps_params={'indent': 2})

# Get saved spotify songs from the API and store them in the database
@api_view(['GET'])
@permission_classes((IsAuthenticated, ))
def getSpotifySavedSongs(request):
  # Obtain the spotify access Token
  access_token = json.loads(obtainSpotifyToken(request._request).content.decode())['access_token']

  offset = 0
  limit = 50
  response = getSpotifySongsAPI(offset, limit, access_token)

  data = json.loads(response.text)

  total = data['total']
  songs = data['items']

  # Keep sending requests to retrieve songs until all is retrieved
  while (offset + limit) < total:
    offset += limit
    response = getSpotifySongsAPI(offset, limit, access_token)
    data = json.loads(response.text)
    songs += data['items']

  # Add each songs to the database if not exists : else - add user to song
  for song in songs:
    track = song['track']
    spotify_pk = Service.objects.get(service_name="Spotify").pk
    track['url'] = track['external_urls']['spotify']
    track['user_pk'] = request.user.pk
    createSong(track, spotify_pk)

  return JsonResponse({'songs' : songs}, json_dumps_params={'indent': 2})

# API - authenticate user with Youtube
def authYoutube(request):
  THIS_FOLDER = os.path.dirname(os.path.abspath(__file__))
  json_file = os.path.join(THIS_FOLDER, 'client_secret.json')

  flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
    json_file,
    scopes=['https://www.googleapis.com/auth/youtube.force-ssl'])
  flow.redirect_uri = "http://localhost:3000/youtubecallback"
  authorization_url, state = flow.authorization_url(
    # Enable offline access so that you can refresh an access token without
    # re-prompting the user for permission. Recommended for web server apps.
    access_type='offline',
    # Enable incremental authorization. Recommended as a best practice.
    include_granted_scopes='true')
  return JsonResponse({'redirect_url': authorization_url})
  return HttpResponseRedirect(authorization_url)

# Receive callback from Youtube and add service to user
@api_view(['GET'])
@permission_classes((IsAuthenticated, ))
def callbackYoutube(request):
  THIS_FOLDER = os.path.dirname(os.path.abspath(__file__))
  json_file = os.path.join(THIS_FOLDER, 'client_secret.json')

  # Send information from Youtube to retrieve the access token to the API
  state = request.GET.get('state')
  flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
    json_file,
    scopes=['https://www.googleapis.com/auth/youtube.force-ssl'],
    state=state)

  flow.redirect_uri = "http://localhost:3000/youtubecallback"
  code = request.GET.get('code')
  flow.fetch_token(code=code)

  # Add the service and access_token to the user in the database
  data = flow.credentials
  service = {
    'user_id': request.user.pk,
    'service_id': Service.objects.get(service_name="Youtube").pk,
    'auth_token': data.token,
    'expire': data.expiry,
    'refresh_token': data.refresh_token
  }
  userservice = UserServiceSerializer(data=service)
  if userservice.is_valid():
    userservice.save()
  else:
    print(userservice.errors)

  # Test api - irrelevant
  youtube = build('youtube', 'v3', credentials=data)

  response = youtube.subscriptions().list(
    part='snippet, contentDetails',
    mine='true',
    maxResults=50
  ).execute()

  print(response)

  return JsonResponse(response, json_dumps_params={'indent': 2})

# API - Obtain the Youtube token for the authenticated user
@api_view(['GET'])
@permission_classes((IsAuthenticated, ))
def obtainYoutubeToken(request):
  youtube = Service.objects.get(service_name="Youtube").pk
  # Get token if exists - error if not
  try:
    user_service = User_Service.objects.get(service_id=youtube, user_id=request.user.pk)
  except User_Service.DoesNotExist:
    return HttpResponse("User does not have this service")

  # If token has expired - renew using refresh token : else return token
  if timezone.now() < user_service.expire:
    return JsonResponse( {'access_token': user_service.auth_token} )
  else:
    # Send credentials to retrieve new token using refresh token
    client_id = credentials.YOUTUBE_CLIENT_ID
    client_secret = credentials.YOUTUBE_CLIENT_SECRET
    data = {
    'grant_type': 'refresh_token',
    'refresh_token': user_service.refresh_token,
    'client_id': client_id,
    'client_secret': client_secret,
    }

    headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
    response = requests.post('https://www.googleapis.com/oauth2/v4/token',
      data=data,
      headers=headers)

    data = response.json()
    # update new token and its new expiry date
    service = {
      'user_id': request.user.pk,
      'service_id': Service.objects.get(service_name="Youtube").pk,
      'auth_token': data.get("access_token"),
      'expire': timezone.now() + timezone.timedelta(seconds=data.get("expires_in")),
      'refresh_token': user_service.refresh_token
    }
    userservice = UserServiceSerializer(data=service)
    if userservice.is_valid():
      userservice.save()
    else:
      print(userservice.errors)

    return JsonResponse( {'access_token': data.get("access_token")} )

# API - Get current Youtube Trending songs
@api_view(['GET'])
@permission_classes((IsAuthenticated, ))
def getYoutubeTrending(request):
  # Obtain Youtube access token from the user
  access_token = json.loads(obtainYoutubeToken(request._request).content.decode())['access_token']
  maxResults = 20

  response = getYoutubeMusic(access_token, "mostPopular", maxResults)
  print(response.text)
  data = json.loads(response.text)
  videos = data.get('items')
  limit = 45

  # Keep retrieving music videos until limit is reached
  while len(videos) < limit:
    nextPageToken = data.get('nextPageToken')
    response = getYoutubeMusic(access_token, "mostPopular", min(limit-len(videos),maxResults), nextPageToken)
    data = json.loads(response.text)
    videos += data.get('items')

  # Remove all trending songs in the database
  removeAllYoutubeTrending()
  songs = []
  # for each songs in the query
  for content in videos:
     vid = content['snippet']
     # Prepare data to create song
     data = {
      'name': vid['title'],
      'url': "https://www.youtube.com/watch?v={}".format(content['id']),
      'id': content['id'],
      'album': {
        'name': "Trending on YouTube",
        'artists': [ {'name': 'YouTube'} ],
        'images': [{'url': 'https://d34qmkt8w5wll9.cloudfront.net/album-covers/medium/trending_on_youtube_250x250.jpg'}]
      },
      'artists': [ {'name': vid['channelTitle'] }],
      'user_pk': request.user.pk
     }

     youtube_pk = Service.objects.get(service_name="Youtube").pk

     createSong(data, youtube_pk, True) # Specify that the song is publicly available to every user
     songs.append(data)

  return JsonResponse({'songs': songs, 'totalResults': len(songs)}, json_dumps_params={'indent': 2})

# API - Given song data - save to the database
@api_view(['POST'])
@permission_classes((IsAuthenticated, ))
def saveSongs(request):
  song = request.data.get("song")
  data = {
      'name': song['name'],
      'url': song['url'],
      'id': song['unique_id'],
      'album': song['album'],
      'artists': [song['artist']],
      'user_pk': request.user.pk
     }
  # Create the song and add it to the user
  if createSong(data, song.get("service")):
    return Response({'song': data}, status=200)
  return Response({'error': 'error adding song'}, status=400)

# API - given query, search songs on Youtube
@api_view(['GET'])
@permission_classes((IsAuthenticated, ))
def getYoutubeSearchSongs(request):
  # Obtain Youtube access token from database
  access_token = json.loads(obtainYoutubeToken(request._request).content.decode())['access_token']
  maxResults = 20

  query = request.GET.get("query")

  response = getYoutubeSearch(access_token, query, maxResults, 'video')
  data = json.loads(response.text)
  videos = data.get('items')
  limit = 45

  # Keep retrieving videos until limit is reached
  while len(videos) < limit:
    nextPageToken = data.get('nextPageToken')
    response = getYoutubeSearch(access_token, query, min(limit-len(videos),maxResults), 'video', nextPageToken)
    data = json.loads(response.text)
    videos += data.get('items')

  youtube_pk = Service.objects.get(service_name="Youtube").pk
  songs = []
  # For each song in query results
  for content in videos:
     vid = content['snippet']
     # Prepare return data
     data = {
      'name': vid['title'],
      'artist': {'name': vid['channelTitle'] },
      'album': None,
      'service': youtube_pk,
      'url': "https://www.youtube.com/watch?v={}".format(content['id']['videoId']),
      'unique_id': content['id']['videoId'],
      }

     songs.append(data)
  # Return query results in the format
  return JsonResponse({'songs': songs, 'totalResults': len(songs)}, json_dumps_params={'indent': 2})

# Upload a file to our s3 bucket
def uploadToS3Bucket(file):

  # Load bucket
  s3 = boto3.client('s3')

  basename = os.path.basename(file)
  bucket = credentials.S3_MP3_BUCKET

  # Upload file to bucket
  s3.upload_file(file, bucket, basename, ExtraArgs={'ACL':'public-read'})

  # Compose the downloadable s3 url and return it
  file_url = '%s/%s/%s' % (s3.meta.endpoint_url, bucket, basename)
  return file_url

# Not used
def downloadFromBucket(request):
  s3 = boto3.resource('s3')

  bucket = credentials.S3_MP3_BUCKET
  basename = 'USAT21804142.mp3'

  THIS_FOLDER = os.path.dirname(os.path.abspath(__file__))

  s3.meta.client.download_file(bucket, basename, os.path.join(THIS_FOLDER, 'test.mp3'))
  return HttpResponse("dsaf")

# API - get mp3 file of the song from s3
@api_view(['GET'])
@permission_classes((IsAuthenticated, ))
def getMP3fromSong(request):
  # Get song from the database
  song_id = request.GET.get('id')
  song = Song.objects.get(id=song_id)

  spotify_pk = Service.objects.get(service_name="Spotify").pk
  youtube_pk = Service.objects.get(service_name="Youtube").pk
  filename = ""

  # If song url already exists - just return it
  if song.s3_url != "":
    return JsonResponse({ 'file_url': song.s3_url })

  # Else upload song to s3

  # check if it is a spotify or youtube song
  # Spotify
  if song.service.pk == spotify_pk:
    THIS_FOLDER = os.path.dirname(os.path.abspath(__file__))
    # download mp3 from spotify
    call(['spotdl',
      '--song', song.url,
      '-f', THIS_FOLDER,
      '-ff', song_id ])
    filename = os.path.join(THIS_FOLDER, song_id + ".mp3")

  # Youtube
  if song.service.pk == youtube_pk:
    THIS_FOLDER = os.path.dirname(os.path.abspath(__file__))
    filename = os.path.join(THIS_FOLDER, "{}.mp3".format(song_id))
    # download mp3 from youtube
    call(['youtube-dl',
      '{}'.format(song.url),
      '-f', 'bestaudio[ext=m4a]', '--audio-format', 'mp3',
      '-o', filename])


  # Upload file to s3 bucket
  file_url = uploadToS3Bucket(filename)

  # Save s3 mp3 url to the database
  song.s3_url = file_url
  song.save()

  # Delete temporary mp3 result from server
  if os.path.exists(filename):
    os.remove(filename)

  return JsonResponse({ 'file_url': file_url })
