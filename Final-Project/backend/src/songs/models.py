from django.db import models
from django.contrib.auth.models import User
from user.models import Service

# Artist Model - Store artist details as well as which users it is available to
class Artist(models.Model):
  name = models.CharField(max_length=128)
  users = models.ManyToManyField(User, blank=True)
  public = models.BooleanField(default=False) # if true - avaliable to everyone

  def __str__(self):
  	return self.name

# Artist Model - Store album details as well as which users it is available to
class Album(models.Model):
  name = models.CharField(max_length=128, unique=True)
  artist = models.ForeignKey(Artist, on_delete=models.CASCADE, null=True, default=1)
  album_cover_url = models.URLField(blank=True)
  users = models.ManyToManyField(User, blank=True)
  public = models.BooleanField(default=False) # if true - avaliable to everyone

  def __str__(self):
    return self.name


# Song Model - Store Song details as well as which users it is available to
class Song(models.Model):
  name = models.CharField(max_length=128)
  artist = models.ForeignKey(Artist, on_delete=models.CASCADE, null=True, default=1)
  album = models.ForeignKey(Album, on_delete=models.CASCADE, null=True, default=1)
  service = models.ForeignKey(Service, on_delete=models.CASCADE)
  url = models.URLField(blank=True, unique=True)
  unique_id = models.CharField(max_length=512, blank=True) # Youtube/Spotify unique_id
  s3_url = models.URLField(blank=True) # store mp3 url store in aws s3
  users = models.ManyToManyField(User, blank=True)
  public = models.BooleanField(default=False)

  def __str__(self):
    return self.name

  class Meta:
    unique_together = ('name', 'artist', 'album', 'service')

# Playlist Model - Store playlists as well as the songs in these playlist
class Playlist(models.Model):
  name = models.CharField(max_length=128)
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  songs = models.ManyToManyField(Song, blank=True)
  def __str__(self):
    return self.name
