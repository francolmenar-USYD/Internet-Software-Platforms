from django.contrib import admin

# Register your models here.
from .models import *

# Registering many to many fields to admin
class PlaylistSong(admin.ModelAdmin):
     model= Playlist
     filter_horizontal = ('songs',) #If you don't specify this, you will get a multiple select widget.

class SongUser(admin.ModelAdmin):
     model= Song
     filter_horizontal = ('users',) #If you don't specify this, you will get a multiple select widget.

class AlbumUser(admin.ModelAdmin):
     model= Album
     filter_horizontal = ('users',) #If you don't specify this, you will get a multiple select widget.

class ArtistUser(admin.ModelAdmin):
     model= Artist
     filter_horizontal = ('users',) #If you don't specify this, you will get a multiple select widget.


admin.site.register(Song, SongUser)
admin.site.register(Album, AlbumUser)
admin.site.register(Artist, ArtistUser)
admin.site.register(Playlist, PlaylistSong)
