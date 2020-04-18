from django.urls import path 

from .views import *

urlpatterns = [
    path('songs', SongListView.as_view()),
    path('songs/<int:pk>/', SongDetailView.as_view()),
    path('service_songs/', SongServiceView.as_view()),
    path('albums/', AlbumListView.as_view()),
    path('albums/<int:pk>/', AlbumDetailView.as_view()),
    path('albums/<int:album>/songs', AlbumSongsView.as_view()),
    path('artists/', ArtistListView.as_view()),
    path('artists/<int:pk>', ArtistDetailView.as_view()),
    path('artists/<int:artist>/songs', ArtistSongsView.as_view()),
    path('playlists/', PlaylistListView.as_view()),
    path('playlist/<int:pk>/', PlaylistDetailedView.as_view()),
    path('myplaylists/', MyPlaylistView.as_view()),
    path('add_playlist/', createPlaylist),
    path('add_to_playlist/', addToPlaylist),
    path('delete_from_playlist/', deleteFromPlaylist),
    path('spotify/callback/', callbackSpotify),
    path('spotify/auth/', authSpotify),
    path('spotify/token', obtainSpotifyToken),
    path('spotify/me/albums', getSpotifySavedAlbums),
    path('spotify/me/songs', getSpotifySavedSongs),
    path('youtube/auth/', authYoutube),
    path('youtube/callback', callbackYoutube),
    path('youtube/token', obtainYoutubeToken),
    path('youtube/trending', getYoutubeTrending),
    path('youtube/search/', getYoutubeSearchSongs),
    path('s3/download/', downloadFromBucket),
    path('get_mp3/', getMP3fromSong),
    path('songs/add/', saveSongs)

]
