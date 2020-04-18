import React from 'react';
import JPlayer, {
  Gui, SeekBar, BufferBar,
  Poster, Audio, Title, FullScreen, Mute, Play, PlayBar,
  VolumeBar, Duration, CurrentTime, Download, BrowserUnsupported,
} from 'react-jplayer';

import JPlaylist, {
  initializeOptions, Playlist, Shuffle, Next, Previous, Repeat,
  TogglePlaylist, Remove, MediaLink, Title as PlaylistTitle,
} from 'react-jplaylist';

// CSS files
import "react-jplayer/dist/css/react-jPlayer.css";
import "react-jplayer/dist/css/skins/sleek.css";
import "./iconControls.css";

// Player that implements Jplayer
const AudioPlayer = (props) => {
    initializeOptions(props.jplayer, props.jplaylist);

    return (
        <JPlaylist id={props.jplayer.id}>
            <JPlayer className="jp-sleek">
              <Audio />
              <Gui>
                <div className="jp-controls jp-icon-controls">
                  <Play><i className="fa">{/* Icon set in css */}</i></Play>
                  <div className="jp-progress">
                    <SeekBar>
                      <BufferBar />
                      <PlayBar />
                      <CurrentTime />
                      <Duration />
                    </SeekBar>
                  </div>
                  <div className="jp-volume-container">
                    <Mute>
                      <i className="fa">{/* Icon set in css */}</i>
                    </Mute>
                    <div className="jp-volume-slider">
                      <div className="jp-volume-bar-container">
                        <VolumeBar />
                      </div>
                    </div>
                  </div>
                  <div className="jp-playlist-container">
                    <Playlist>
                      <Remove />
                      <MediaLink>
                        <PlaylistTitle />
                      </MediaLink>
                    </Playlist>
                  </div>
                  <div className="jp-title-container">
                    <Poster />
                    <Title />
                  </div>
                </div>
                <BrowserUnsupported />
              </Gui>
            </JPlayer>
          </JPlaylist>
        );
};

export default AudioPlayer;
