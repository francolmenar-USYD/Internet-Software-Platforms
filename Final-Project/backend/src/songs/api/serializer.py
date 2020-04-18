# Django Rest Framework Serializer - serialize data and store them into our database


from rest_framework import serializers
from songs.models import Song, Album, Artist, Playlist

# Serializer for Song
class SongSerializer(serializers.ModelSerializer):
	# matches album/artist id with name and return
	album_name = serializers.CharField(source='album.name', required=False)
	artist_name = serializers.CharField(source='artist.name', required=False)

	class Meta:
		model = Song
		fields = ('id', 'name', 'artist', 'album', 'service', 'url', 'unique_id', 's3_url', 'album_name', 'artist_name', 'users', 'public')
		read_only_fields = ('album_name', 'artist_name')
		filter_fields = ('name', 'album')

# Serializer for Album
class AlbumSerializer(serializers.ModelSerializer):

	artist_name = serializers.CharField(source='artist.name', required=False)

	class Meta:
		model = Album
		fields = ('id', 'name', 'album_cover_url', 'artist', 'artist_name', 'public')

# Serializer for Artist
class ArtistSerializer(serializers.ModelSerializer):
	class Meta:
		model = Artist
		fields = ('id', 'name', 'public')

# Serializer for Playlist
class PlaylistSerializer(serializers.ModelSerializer):
	class Meta:
		model = Playlist
		fields = ('id', 'name', 'user', 'songs')
