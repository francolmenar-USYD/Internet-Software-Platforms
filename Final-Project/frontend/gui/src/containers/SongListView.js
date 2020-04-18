import React, {Component} from 'react';
import axios from 'axios';
import { Table, Button, Input, Popover, List, Pagination, message} from 'antd'
import queryString from 'query-string'
import {Provider} from 'react-redux';
import 'antd/dist/antd.css';

import CustomLayout from './Layout'
import AudioPlayer from '../components/audioPlayer';
import '../components/jPlayersActions.js'

import {createStore, combineReducers} from 'redux';
import {reducer as jPlayers} from 'react-jplayer';
import { reducer as jPlaylists } from 'react-jplaylist';
import { actions } from 'react-jplayer'
import { actions as playlistActions } from 'react-jplaylist'
import equal from 'fast-deep-equal'


/* Pass the jPlayer reducer and it's initialStates to the store */
const Search = Input.Search;
const store = createStore(combineReducers({jPlayers, jPlaylists}));

// The class handles rendering of Songs, Songlists, Album_songs, Artist_songs
class SongListView extends Component {
    constructor(props){
      super(props)
      this.handleClick = this.handleClick.bind(this);
      this.handleChangeStore = this.handleChangeStore.bind(this);
      this.currentValue = store.getState(); // current store state with Jpalyer

      this.state={
        popVisible:false,
        player:{
            id: 'AudioPlayer',
            keyEnabled: true,
            verticalVolume: true,
            smoothPlayBar: true,
            media: {
              id: 0,
              title: '-',
              artist: '-',
              sources: {
                mp3: null
              },
              free: false,
            },
            autoplay: false,
        }, //Jplayer setups

        playlists: {
          keyEnabled: true,
          verticalVolume: true,
          smoothPlayBar: true,
          hidePlaylist: true,
          playlist: [
            {
              id: 0,
              title: '-',
              artist: '-',
              sources: {
                mp3: null
              },
              free: false,
            },
          ],
        }, //Jplaylist setups

        playing: false,// if playing songs 

        sortedInfo:{
          order:false,
          columnKey:" "
        },//sort information for songs table

        authStr:"Token " + localStorage.getItem("token"),
        isMounted: false //is the component mounted
      };
    }

    componentWillUnmount() {
      this.setState( { isMounted: false } ) //disable setState when the component is destoried
    }

    componentDidMount() {
      this.loadSongs()
    }

    componentDidUpdate(prevProps){
      const this_value = queryString.parse(this.props.location.search)
      const prev_value = queryString.parse(prevProps.location.search)
      if(!equal(this_value.keyword, prev_value.keyword) || 
        !equal(this_value.playlist_id, prev_value.playlist_id)){
        this.loadSongs();
      }
    }

    loadSongs() {
      this.setState({ loading: true, isMounted: true}); //set songs are loading
      var songs = []
      var playlists = []

      //getting playlists data from server
      axios.get('http://ec2-13-55-117-84.ap-southeast-2.compute.amazonaws.com:8000/api/myplaylists/', { 'headers': { 'Authorization': this.state.authStr } })
      .then( res => {
        if( this.state.isMounted ) {
          this.setState({myPlaylists: res.data,})
        }
      });

      var path = this.props.location.pathname
      path = path[path.length - 1] == "/" ? path :path + "/"//current pathname
      const value = queryString.parse(this.props.location.search)//current query values

      //url: /songs
      if(path == "/songs/"){
        axios.get('http://ec2-13-55-117-84.ap-southeast-2.compute.amazonaws.com:8000/api/songs', { 'headers': { 'Authorization': this.state.authStr } })
        .then(
          res => {
            if( this.state.isMounted ) {
              this.setState({
                songs: res.data, 
                filteredSongs: res.data, 
                loading: false,
                header: "All Songs",
              })
            }
        }); 

      //url: /playlists
      }else if(path.startsWith("/playlist")){
        axios.get('http://ec2-13-55-117-84.ap-southeast-2.compute.amazonaws.com:8000/api/playlist/' + value.playlist_id + "/", { 'headers': { 'Authorization': this.state.authStr } })
        .then( res => {
          if( this.state.isMounted ) {
            this.setState({
              songs: res.data, 
              filteredSongs: res.data, 
              loading: false,
              header: this.state.myPlaylists.find((item)=>item.id == value.playlist_id).name,
            });
          }
        });

      //url: /albums_songs
      }else if(path.startsWith("/albums_songs")){
        if(value != null && 'id' in value){
          axios.get('http://ec2-13-55-117-84.ap-southeast-2.compute.amazonaws.com:8000/api/albums/' + value.id + '/songs', {'headers': {'Authorization': this.state.authStr}})
          .then(res => {
            if( this.state.isMounted) {
              this.setState({
                songs: res.data, 
                filteredSongs: res.data,
                loading: false,
                header: "Songs in " + res.data[0].album_name,
              });
            }
          });
        }

      //url: /artists_songs
      }else if(path.startsWith("/artists_songs")){
        if(value != null && 'id' in value){
          axios.get('http://ec2-13-55-117-84.ap-southeast-2.compute.amazonaws.com:8000/api/artists/' + value.id + '/songs', {'headers': {'Authorization': this.state.authStr}})
          .then(res => {
            if( this.state.isMounted ) {
              this.setState({
                songs: res.data, 
                filteredSongs: res.data,
                loading: false,
                header: "Songs by " + res.data[0].artist_name,
              });
            }
          });
        }

      //url: /search
      }else if(path.startsWith("/search")){
        if(value != null && 'keyword' in value){
          axios.get('http://ec2-13-55-117-84.ap-southeast-2.compute.amazonaws.com:8000/api/youtube/search/?query=' + value.keyword ,{'headers': { 'Authorization': this.state.authStr }})
          .then(res => {
            if (res.status == 200) {
              if( this.state.isMounted ) {
                this.setState({
                  songs: res.data.songs, 
                  filteredSongs: res.data.songs,
                  loading: false,
                  header: "Search results for \"" + value.keyword + "\"",
                });
              }
            }
          });
        } 
      }
    }

    //handle changes of current song
    handleChangeStore(){
      if (this.currentValue.jPlayers.AudioPlayer != null){
        let previousValue = this.currentValue;
        this.currentValue = store.getState()

        let prevSong = previousValue.jPlayers.AudioPlayer.src
        let currentSong = this.currentValue.jPlayers.AudioPlayer.src
        //set new songs 
        if (prevSong != currentSong){
          console.log("NEW SONG")
          let songData = this.currentValue.jPlayers.AudioPlayer.media
          if(!songData.sources.mp3){
            axios.get('http://ec2-13-55-117-84.ap-southeast-2.compute.amazonaws.com:8000/api/get_mp3/?id='+songData.id, { 'headers': { 'Authorization': this.state.authStr } }).then(
              res => {
                var player = this.state.player
                let playlist = this.currentValue.jPlaylists.AudioPlayer.playlist
                let current = this.currentValue.jPlaylists.AudioPlayer.current
                let song = playlist[current]
                song.sources.mp3 = res.data.file_url
                store.dispatch({
                  type: "ADD_MEDIA_SRC",
                  playlist: playlist

                })
                console.log(song)
                store.dispatch(actions.setMedia(player.id, song))
                store.dispatch(playlistActions.play(player.id, current));
            })
          }
        }
      }
    }

    //handle click on the play button in the table
    handleClick(id, current_id){

        //if current song is in the player
        if(id == current_id){
          if(this.state.playing){
            store.dispatch(actions.pause(this.state.player.id));
          }else{
            store.dispatch(actions.play(this.state.player.id));
          }
          this.setState({
            playing: !this.state.playing
          })

        }else{
          var record_index = this.state.songs.findIndex(song => song.id === id)
          var record = this.state.songs[record_index]
          var player = this.state.player
          var playlists = this.state.playlists

          // get the mp3 file in the database
          axios.get('http://ec2-13-55-117-84.ap-southeast-2.compute.amazonaws.com:8000/api/get_mp3/?id='+id, { 'headers': { 'Authorization': this.state.authStr } })
          .then(res => {
            let pl = store.getState().jPlaylists.AudioPlayer.playlist
            if(pl[0].id == 0){
              store.dispatch(playlistActions.clear(player.id));
              playlists.playlist = []
            }

            const newSong = {
              id: id,
              title: record.name,
              artist: record.artist_name,
              sources: {
                  mp3: res.data.file_url
              },
              free: false,
            };

            let songExists = false
            for(let i = 0; i < pl.length; i++) {
              if (pl[i].id == id){
                songExists = true;
                store.dispatch(playlistActions.play(player.id, i));
              }
            }

            if(!songExists){
              store.dispatch(playlistActions.add(player.id, newSong, true))
            }
            playlists.playlist = store.getState().jPlaylists.AudioPlayer.playlist
            this.setState({
              playlists:playlists,
              playing: true,
            })
          }).catch(error => {
          if (axios.isCancel(error)) {
            console.log('Request canceled', error);
          }else{
            console.log(error);
          }
        })
      }
    }

    //handle adding song to the playlists
    handleAddSong(song_id, playlist_id){
      try {
        axios.post('http://ec2-13-55-117-84.ap-southeast-2.compute.amazonaws.com:8000/api/add_to_playlist/', {'playlist': playlist_id, "songs":[song_id] }  ,{'headers': { 'Authorization': this.state.authStr }})
          .then(res => {
              if (res.status == 200) {
                  message.success("Success!")
              }
          })
      } catch (e) {
          message.error(e.message);
      }
    }

    //handle change of sorting order and key in the table 
    handleChange = (pagination, filters, sorter) => {
      this.setState({
        sortedInfo: sorter,
      });
    }

    // handle the click on the column title in the table to change sorting
    handleSort = (column) =>{
      var { sortedInfo } = this.state;
      var order = "ascend";
      var columnKey = column.key;
      if( column.key == sortedInfo.columnKey){
        if( sortedInfo.order == "ascend" ){
          order = "descend"
        }
        else if(sortedInfo.order == "descend"){
          order = false
        }
      }
      this.setState({sortedInfo:{order: order, columnKey: columnKey}})
    }

    //handle filtering the song table
    handleFilter = (value) => {
      const filteredSongs = this.state.songs.filter(({ name, artist_name, album_name }) =>
        {
            name = name.toLowerCase();
            artist_name = artist_name.toLowerCase();
            album_name = album_name.toLowerCase();
            value = value.toLowerCase();
            //matching all the songs, artists and albums starts with the value
            return name.startsWith(value) || artist_name.startsWith(value) || album_name.startsWith(value) ;
          });
      this.setState({
        filteredSongs: filteredSongs
      });
    }

    render() {
      if(this.props.isAuthenticated){
        var { sortedInfo } = this.state;
        var columns = [
          {
              title: '',
              dataIndex: 'id',
              key:"play",
              align: 'center',
              width: 80,
              render:(id)=> {
                var index = store.getState().jPlaylists.AudioPlayer.current;
                var current_id = this.state.playlists.playlist[index].id
                return <Button shape="circle" icon = {current_id == id && this.state.playing ? "pause" : "caret-right" }  onClick={this.handleClick.bind(null,id, current_id)}/>
              }
          },{
              title: 'Title',
              dataIndex: 'name',
              key:"name",
              align: 'center',
              width: 150,
              sorter: (a, b) => a.name.localeCompare(b.name),
              sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
              onHeaderCell: (column) => {
                return {
                  onClick:() => {
                    this.handleSort(column)
                  }
                }
              },
            }, {
              title: 'Artist',
              dataIndex: 'artist',
              key:"artist_name",
              align: 'center',
              width: 150,
              sorter: (a, b) => a.artist_name.localeCompare(b.artist_name),
              sortOrder: sortedInfo.columnKey === 'artist_name' && sortedInfo.order,
              onHeaderCell: (column) => {
                return {
                  onClick:() => {
                    this.handleSort(column)
                  }
                }
              },
              render:(id)=> {
                var result = this.state.songs.find(item => item.artist == id);
                return <a onClick={()=> {
                  this.props.history.push("/artists_songs?id="+ id) //only keep songs with current artist
                }}> 
                {result.artist_name} 
                </a> 
              }
            }, {
              title: 'Album',
              dataIndex: 'album',
              key:"album_name",
              align: 'center',
              width: 150,
              sorter: (a, b) => a.album_name.localeCompare(b.album_name),
              sortOrder: sortedInfo.columnKey === 'album_name' && sortedInfo.order,
              onHeaderCell: (column) => {
                return {
                  onClick:() => {
                    this.handleSort(column)
                  }
                }
              },
              render: (id)=>{
                var result = this.state.songs.find(item => item.album == id);
                return <a onClick={()=> 
                  this.props.history.push("/albums_songs?id=" + id) //only keep songs with current album 
                }>{result.album_name} 
                </a>
              }
            },{
              title: '',
              key: 'add',
              dataIndex: 'id',
              align: 'center',
              width: 80,
              render:(id)=> {
                return (<div style={{textAlign: 'center'}} ><Popover
                  content={ <List size="small" dataSource={this.state.myPlaylists}
                            renderItem={item =><a onClick={()=> this.handleAddSong(id, item.id)}><List.Item>{item.name}</List.Item></a>}/>
                  }
                  title="Add to Playlist"
                  trigger="hover"
                >
                  <Button shape="circle" icon ="ellipsis"/>
                </Popover></div>)}
            }];

          return (
              <div className="SongListView">
                  <CustomLayout app={this.props}>
                    <div>
                      <div><h2>{this.state.header}</h2></div>

                      {/* Filter */}
                      <Search
                        size="large"
                        placeholder="Filter..."
                        onChange={(e)=> this.handleFilter(e.target.value)}
                        onSearch={(value)=> this.handleFilter(value)}
                      />
                    </div>
                      {/* Table */}
                      <Table
                      size = 'middle'
                      onChnage= {this.handleChange}
                      rowKey= "id" pagination={{ pageSize: 30, align: 'center' }}loading={this.state.loading} 
                      columns={columns} dataSource={this.state.filteredSongs} onCellClick={this.handleCellClick}
                      />
                  </CustomLayout>

                  {/* Player */}
                  <Provider store={store}>
                      <AudioPlayer jplayer={this.state.player} jplaylist={this.state.playlists}/>
                  </Provider>
              </div>
          );
      }
      else{
          this.props.history.push("/");
          return ""
      }
    }
}

export default SongListView;
