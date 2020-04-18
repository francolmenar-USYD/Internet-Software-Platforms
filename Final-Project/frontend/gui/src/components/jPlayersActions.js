import React from 'react';
import { connect } from 'react-redux';
import { actions } from 'react-jplayer';

//Set connection to store with Jplayer
const mapStateToProps = state => ({
  showRemainingDuration: state.jPlayers.AudioPlayer.showRemainingDuration,
});

const Component = ({ showRemainingDuration, dispatch }) =>
  <div onClick={() => dispatch(actions.setOption('AudioPlayer', 'showRemainingDuration', !showRemainingDuration))}>
    Toggle Duration </div>;

export default connect(mapStateToProps)(Component);