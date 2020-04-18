import React from "react";
import { Route, Switch } from "react-router-dom";
import {Spin} from "antd"
import AppliedRoute from "./components/AppliedRoute";
import queryString from 'query-string'
import axios from 'axios';

import Login from "./containers/Login"
import SongListView from "./containers/SongListView";
import AlbumView from "./containers/AlbumView"
import ArtistView from "./containers/ArtistView"
import Signup from "./containers/Signup"


export default ({ childProps }) =>
<Switch>

  <AppliedRoute path="/songs" exact component={SongListView} props={childProps} />
  <AppliedRoute path="/signup" exact component={Signup} props={childProps} />
  <AppliedRoute path="/songs" key="songs" exact component={SongListView} props={childProps} />
  <AppliedRoute path="/albums" exact component={AlbumView} props={childProps}/>
  <AppliedRoute path="/albums_songs" key="albums_songs" exact component={SongListView} props={childProps}/>
  <AppliedRoute path="/artists" exact component={ArtistView} props={childProps}/>
  <AppliedRoute path="/artists_songs" keys="artists_songs" exact component={SongListView} props={childProps}/>
  <AppliedRoute path="/search" keys="search_results" exact component={SongListView} props={childProps}/>
  <AppliedRoute path="/playlist" keys="playlist" exact component={SongListView} props={childProps}/>

  
  <Route {...childProps} path="/spotifycallback" exact render={ props => {
    const authStr = "Token " + localStorage.getItem("token")
    const value = queryString.parse(props.location.search)
    axios.get('http://ec2-13-55-117-84.ap-southeast-2.compute.amazonaws.com:8000/api/spotify/callback/?code=' + value.code, {'headers': {'Authorization': authStr}}).then(res => {
      axios.get('http://ec2-13-55-117-84.ap-southeast-2.compute.amazonaws.com:8000/api/spotify/me/songs', {'headers': {'Authorization': authStr}}).then(res=> {window.close(); window.opener.location.reload(); })
    })
    return(
      <div style={{marginLeft: "50vw", marginTop: "50vh"}} ><Spin size="large"/></div>)
   }
  } />

  <Route {...childProps} path="/youtubecallback" exact render={ props => {
    const authStr = "Token " + localStorage.getItem("token")
    const value = queryString.parse(props.location.search)
    axios.get('http://ec2-13-55-117-84.ap-southeast-2.compute.amazonaws.com:8000/api/youtube/callback?code=' + value.code + "?state=" + value.state, {'headers': {'Authorization': authStr}}).then(res=> {window.close(); window.opener.location.reload();})
    return(
      <div style={{marginLeft: "50vw", marginTop: "50vh"}} ><Spin size="large"/></div>)
   }
  } />

  { /* Finally, catch all unmatched routes */ }
  <Route {...childProps} render={props => { 
    props.history.push("/") 
    return ""
  }} />

</Switch>;
