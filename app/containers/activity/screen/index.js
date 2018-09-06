import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {CachedImage} from "react-native-img-cache";
import { Text } from 'native-base';
import {
  Player,
  MediaStates
} from 'react-native-audio-toolkit';

import {randomLink} from '../../../helper';
import TextEntry from './TextEntry';

const styles = StyleSheet.create({
  content: {
    flexDirection: 'column'
  },
  padding: {
    padding: 20,
  },
  paddingContent: {
    paddingLeft: 20,
    paddingRight: 20,
    flexDirection: 'column',
  },
  text: {
    paddingTop: 20,
    paddingBottom: 20,
  }
})
class Screen extends Component {
  static propTypes = {
    path: PropTypes.string
  }
  componentWillMount() {
    this.setState({});
  }
  componentDidMount() {
    const {screen: {meta: data}} = this.props;
    if(data.audio && data.audio.display && data.audio.files.length > 0) {
      this.player = new Player(randomLink(data.audio.files), {
        autoDestroy: true
      }).prepare((err) => {
          if (err) {
              console.log('error at _reloadPlayer():');
              console.log(err);
          } else {
              this.player.playPause((err, playing) => {
              })
          }
      });
    }
  }

  setAnswer(data) {
    let {answer} = this.state;
    answer = {...answer, ...data};
    this.setState({answer});
  }

  answer(key) {
    return this.state[key];
  }
  render() {
    const {screen: {meta: data}} = this.props;
    console.log(data);
    return (
      <View style={styles.content}>
        { data.pictureVideo.display && data.pictureVideo.files.length > 0 &&
          <CachedImage style={{width: '100%', height: 200, resizeMode: 'cover'}} source={{uri: randomLink(data.pictureVideo.files)}}/>
        }
        <View style={styles.paddingContent}>
          <Text style={styles.text}>{data.text}</Text>
          {
            data.textEntry && data.textEntry.display && 
            <TextEntry config={data.textEntry} answer={this.answer('text')} onChange={text => this.setAnswer({text})} />
          }
        </View>
        
      </View>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  screen: state.core.data && state.core.data[ownProps.path] || {meta:{}}
})

const mapDispatchToProps = {
  
}

export default connect(mapStateToProps, mapDispatchToProps)(Screen)
