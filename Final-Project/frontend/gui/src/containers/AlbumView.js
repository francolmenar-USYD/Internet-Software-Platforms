import React, {Component} from 'react';
import 'antd/dist/antd.css';
import {Provider} from 'react-redux';
import {createStore, combineReducers} from 'redux';
import {reducer as jPlayers} from 'react-jplayer';

import CustomLayout from './Layout'
import AlbumList from './AlbumListView'
import AudioPlayer from '../components/audioPlayer';

/* Pass the jPlayer reducer and it's initialStates to the store */
const store = createStore(combineReducers({jPlayers}));

//Jplayer setting
const defaultOptionsJP = {
    id: 'AudioPlayer',
    keyEnabled: true,
    verticalVolume: true,
    smoothPlayBar: true,
    media: {
        title: 'Bubble',
        artist: 'Miaow',
        sources: {
            m4a: 'http://jplayer.org/audio/m4a/Miaow-07-Bubble.m4a',
            oga: 'http://jplayer.org/audio/ogg/Miaow-07-Bubble.ogg',
        },
        free: true,
    },
};

// The view for albums page
class AlbumView extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        if(this.props.isAuthenticated){
            return (
                <div className="AlbumView">
                    <CustomLayout app={this.props}>
                        <AlbumList  props={this.props}/>
                    </CustomLayout>
                </div>
            );
        }
        else{
            this.props.history.push("/");
            return ""
        }
    }
}

export default AlbumView;