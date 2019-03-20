import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { Content, Text, Button, Icon } from 'native-base';
import { Player, MediaStates } from 'react-native-audio-toolkit';
import * as R from 'ramda';

import { randomLink } from '../../services/helper';
import SurveySection from '../../widgets/survey';
import CanvasSection from '../../widgets/canvas';
import TextEntry from '../../widgets/TextEntry';
import GImage from '../image/Image';

const styles = StyleSheet.create({
  content: {
    flexDirection: 'column',
  },
  padding: {
    padding: 20,
  },
  paddingContent: {
    paddingLeft: 20,
    paddingRight: 20,
    flexDirection: 'column',
    flexGrow: 1,
  },
  text: {
    paddingTop: 20,
    paddingBottom: 20,
  },
});

class Screen extends Component {
  static isValid(answer, screen) {
    const surveyType = R.path(['meta', 'surveyType'], screen);
    if (typeof surveyType !== 'undefined') {
      return SurveySection.isValid(answer, screen.meta.survey, screen.meta.surveyType);
    }
    return typeof answer !== 'undefined';
  }

  componentWillMount() {
    // temporary - sets whether camera surveys can be answered with a video.
    // when false, only photos can be uploaded.
    // should be connected to admin panel eventually.
    this.video = false;
  }

  componentDidMount() {
    const { screen, authToken } = this.props;
    const { audio } = screen.meta;
    if (audio && audio.display && audio.files.length > 0) {
      this.audioLink = randomLink(audio.files, authToken);
      if (audio.autoPlay) {
        this.playAudio();
      }
    }
  }

  componentWillUnmount() {
    if (this.player && this.player.state !== MediaStates.DESTROYED) {
      this.player.destroy();
    }
  }

  onAnswer = (answer, validated, next) => {
    const { onChange } = this.props;
    onChange(answer, validated, next);
  }

  playAudio = () => {
    if (this.player && this.player.state !== MediaStates.DESTROYED) {
      this.player.stop();
      this.player = null;
    } else {
      console.log(this.audioLink);
      this.player = new Player(this.audioLink, {
        autoDestroy: true,
      }).prepare((err) => {
        if (err) {
          console.log('error at _reloadPlayer():');
          console.log(err);
        } else {
          this.player.playPause();
        }
      });
    }
  }

  reset() {
    if (this.canvasRef) {
      this.canvasRef.resetData();
    }
    if (this.surveyRef) {
      this.surveyRef.resetData();
    }
  }

  renderPicture = data => data.pictureVideo
    && data.pictureVideo.display
    && data.pictureVideo.files.length > 0
    && (
      <GImage
        file={data.pictureVideo.files}
        style={{ width: '100%', height: 200, resizeMode: 'cover' }}
      />
    );

  renderSurvey(data) {
    const { answer } = this.props;
    return data.surveyType && (
      <SurveySection
        type={data.surveyType}
        config={data.survey}
        answer={answer}
        onChange={this.onAnswer}
        ref={(ref) => { this.surveyRef = ref; }}
        onNextChange={() => {}}
      />
    );
  }

  renderCanvas(data) {
    const { answer } = this.props;
    return data.canvasType && (
      <CanvasSection
        video={this.video}
        type={data.canvasType}
        config={data.canvas}
        answer={answer}
        onChange={this.onAnswer}
        ref={(ref) => { this.canvasRef = ref; }}
        onNextChange={() => {}}
      />
    );
  }

  renderScrollContent() {
    const { screen, answer, onChange } = this.props;
    const data = screen.meta || {};
    const hasAudio = data.audio && data.audio.display && data.audio.files.length > 0;
    return (
      <Content style={{ flex: 1 }}>
        {this.renderPicture(data)}
        <View style={styles.paddingContent}>
          {hasAudio && data.audio.playbackIcon && <Button transparent onPress={this.playAudio}><Icon name="volume-up" /></Button> }
          { data.surveyType !== 'audio' && <Text style={styles.text}>{data.text}</Text> }
          { this.renderSurvey(data) }
          { this.renderCanvas(data) }
          {
            data.textEntry && data.textEntry.display && (
              <TextEntry
                style={styles.text}
                config={data.textEntry}
                answer={answer}
                onChange={text => onChange({ text })}
              />
            )
          }
          { data.surveyType === 'audio' && <Text style={styles.text}>{data.text}</Text> }
        </View>
      </Content>
    );
  }

  renderContent() {
    const { screen, onChange, answer } = this.props;
    const data = screen.meta || {};
    const hasAudio = data.audio && data.audio.display && data.audio.files.length > 0;
    return (
      <View style={styles.paddingContent}>
        {this.renderPicture(data)}
        {hasAudio && data.audio.playbackIcon && <Button transparent onPress={this.playAudio}><Icon name="volume-up" /></Button> }
        {/* todo: animate this text below */}
        <Text style={styles.text}>{data.text}</Text>
        { this.renderSurvey(data) }
        { this.renderCanvas(data) }
        {
          data.textEntry && data.textEntry.display && (
            <TextEntry
              style={styles.text}
              config={data.textEntry}
              answer={answer}
              onChange={text => onChange({ text })}
            />
          )
        }
      </View>
    );
  }

  render() {
    const { screen } = this.props;
    return (
      <View style={{ flex: 1, flexDirection: 'column' }}>
        {
          screen.meta && (
            (screen.meta.surveyType === 'slider' || screen.meta.canvasType === 'draw')
              ? this.renderContent()
              : this.renderScrollContent())
        }
      </View>
    );
  }
}

Screen.defaultProps = {
  answer: undefined,
};

Screen.propTypes = {
  screen: PropTypes.object.isRequired,
  answer: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  authToken: PropTypes.string.isRequired,
};

export default Screen;
