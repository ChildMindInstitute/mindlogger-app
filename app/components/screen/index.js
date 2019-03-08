import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Content, Text, Button, Icon } from 'native-base';
import {
  Player,
  MediaStates
} from 'react-native-audio-toolkit';

import {randomLink} from '../../helper';
import TextEntry from './TextEntry';
import ScreenButton from './ScreenButton';
import SurveySection from '../../widgets/survey';
import CanvasSection from '../../widgets/canvas';
import GImage from '../image/Image';

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
    flexGrow: 1,
  },
  text: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
  },
})
class Screen extends Component {
  static propTypes = {
    path: PropTypes.string
  }
  componentWillMount() {
    this.setState({
      answer: this.props.answer && this.props.answer.data,
      validated: true,
    });
  }
  componentDidMount() {
    let {screen: {meta: data}, auth} = this.props;
    data = data || {};
    if(data.audio && data.audio.display && data.audio.files.length > 0) {
      this.audioLink = randomLink(data.audio.files, auth.token);
      if (data.audio.autoPlay)
        this.playAudio();
    }
  }

  playAudio = () => {
    if(this.player && this.player.state != MediaStates.DESTROYED) {
      this.player.stop();
      this.player = null;
    } else {
      console.log(this.audioLink);
      this.player = new Player(this.audioLink, {
        autoDestroy: true
      }).prepare((err) => {
          if (err) {
              console.log('error at _reloadPlayer():');
              console.log(err);
          } else {
              this.player.playPause((err, audioPlaying) => {
              })
          }
      });
    }
  }

  componentWillUnmount() {
    let {screen: {meta: data}} = this.props;
    data = data || {};
    if(data.audio && this.player && this.player.state != MediaStates.DESTROYED) {
      this.player.destroy();
    }
  }

  setAnswer(newAnswer, validated, callback) {
    let {answer} = this.state;
    const {screen: {meta: data = {}}} = this.props;
    answer = {...answer, ...newAnswer, type: data.surveyType};
    if (validated == undefined) {
      this.setState({answer}, callback);
    } else {
      this.setState({answer, validated}, callback);
    }
  }

  answer(key) {
    return this.state.answer && this.state.answer[key];
  }

  onNextChange = (nextScreen) => {
    this.setState({nextScreen})
  }

  handleReset = () => {
    this.setState({answer:undefined});
    if(this.canvasRef) {
      this.canvasRef.resetData();
    }
    if(this.surveyRef) {
      this.surveyRef.resetData();
    }
  }
  handleAction = () => {
    if(this.canvasRef) {
      this.canvasRef.takeAction();
    }
  }

  getPayload(){
    const {path, screen} = this.props;
    const {meta: data={}} = screen;
    const {answer} = this.state;
    let payload = {'@id': screen._id, data: answer};
    if(data.text)
      payload.text = data.text;
    return payload;
  }

  handlePrev = () => {
    this.props.onPrev(this.getPayload());
  }

  handleSkip = () => {
    const {screen: {meta: data}, onNext, path} = this.props;
    let payload = {'@id': path,  data: undefined};
    onNext(payload, data.skipToScreen);
  }

  handleNext = () => {
    const {nextScreen} = this.state;
    this.props.onNext(this.getPayload(), nextScreen);
  }

  onAnswer(data, validated, next) {
    let { length, index } = this.props;
    const {nextScreen} = this.state;

    const isFinal = (nextScreen || (index + 1)) >= length;
    if(next && !isFinal) {
      this.setAnswer(data, validated, () => {
        this.handleNext();
      });
    } else {
      this.setAnswer(data, validated);
    }
  }

  onSurvey = (survey, validated, next) => {
    this.onAnswer({survey}, validated, next);
  }

  onCanvas = (canvas, validated, next) => {
    this.onAnswer({canvas}, validated, next);
  }

  getButtonState() {
    let {
      screen: {meta: data},
      globalConfig,
      info,
      length,
    } = this.props;
    data = data || {};
    const {answer, nextScreen, validated} = this.state;
    const {surveyType, canvasType, textEntry} = data;

    const isFinal = (nextScreen || (this.props.index + 1)) >= length;
    let prevButtonText;
    let actionButtonText;
    let nextButtonText;
    const permission = globalConfig.permission || {};
    const skippable = data.skippable == undefined ? permission.skip : data.skippable;
    const prevable = permission.prev;

    if ((!surveyType && !canvasType && !textEntry) || info) {
      prevButtonText = "Back";
      nextButtonText = isFinal ? "Done" : "Next";
    } else {
      if (prevable) prevButtonText = "Back";
      if (answer) {
        actionButtonText = "Undo";
        if (validated) nextButtonText = isFinal ? "Done" : "Next";
      } else {
        if(canvasType == 'camera') {
          actionButtonText = null;
        } else if (canvasType == 'draw' && data.canvas.mode == "camera") {
          actionButtonText = "Take";
        }
        if (skippable) nextButtonText = isFinal ? "Done" : "Skip";
      }
    }
    return { prevButtonText, actionButtonText, nextButtonText };
  }

  renderButtons() {
    const {answer} = this.state;
    const {prevButtonText, actionButtonText, nextButtonText} = this.getButtonState();
    return (<View style={styles.footer}>
      {prevButtonText ? <ScreenButton transparent onPress={this.handlePrev} text={prevButtonText}/> : <ScreenButton transparent/> }
      {actionButtonText ? <ScreenButton onPress={answer ? this.handleReset : this.handleAction} text={actionButtonText}/> : <ScreenButton transparent/> }
      {nextButtonText ? <ScreenButton transparent onPress={answer ? this.handleNext : this.handleSkip} text={nextButtonText}/> : <ScreenButton transparent/> }
    </View>)
  }

  renderPicture(data) {
    return data.pictureVideo && data.pictureVideo.display && data.pictureVideo.files.length > 0 &&
      <GImage file={data.pictureVideo.files} style={{width: '100%', height: 200, resizeMode: 'cover'}} />
  }

  renderSurvey(data) {
    return data.surveyType && <SurveySection
            type={data.surveyType}
            config={data.survey}
            answer={this.answer('survey')}
            onChange={this.onSurvey}
            onNextChange={this.onNextChange}
            ref={ref => {this.surveyRef = ref}}
            />
  }

  renderCanvas(data) {
    return data.canvasType && <CanvasSection
            video={(data.canvasType == 'video')}
            type={((data.canvasType == 'video') ? 'camera' : data.canvasType)}
            config={data.canvas}
            answer={this.answer('canvas')}
            onChange={this.onCanvas}
            ref={ref => {this.canvasRef = ref}}
            onNextChange={this.onNextChange}
            />
  }
  renderScrollContent() {
    let {screen: {meta: data}} = this.props;
    data = data || {};
    let hasAudio = data.audio && data.audio.display && data.audio.files.length>0;
    return (<Content style={{ flex: 1}}>
      {this.renderPicture(data)}
      <View style={styles.paddingContent}>
        {hasAudio && data.audio.playbackIcon && <Button transparent onPress={this.playAudio}><Icon name="volume-up" /></Button> }
        { data.surveyType != 'audio' && <Text style={styles.text}>{data.text}</Text> }
        { this.renderSurvey(data) }
        { this.renderCanvas(data) }
        {
          data.textEntry && data.textEntry.display &&
          <TextEntry
            style={styles.text}
            config={data.textEntry}
            answer={this.answer('text')}
            onChange={text => this.setAnswer({text})}/>
        }
        { data.surveyType == 'audio' && <Text style={styles.text}>{data.text}</Text> }
      </View>
    </Content>)
  }

  renderContent() {
    let {screen: {meta: data}} = this.props;
    data = data || {};
    let hasAudio = data.audio && data.audio.display && data.audio.files.length>0;
    return (<View style={styles.paddingContent}>
      {this.renderPicture(data)}
        {hasAudio && data.audio.playbackIcon && <Button transparent onPress={this.playAudio}><Icon name="volume-up" /></Button> }
        {/* todo: animate this text below */}
        <Text style={styles.text}>{data.text}</Text>
        { this.renderSurvey(data) }
        { this.renderCanvas(data) }
        {
          data.textEntry && data.textEntry.display &&
          <TextEntry
            style={styles.text}
            config={data.textEntry}
            answer={this.answer('text')}
            onChange={text => this.setAnswer({text})}/>
        }
    </View>)
  }

  render() {
    let {screen: {meta: data}} = this.props;
    console.log("Screen:", data);
    return (
      <View style={{flex: 1, flexDirection: 'column'}}>
        {
          data && (
          (data.surveyType == 'slider' || data.canvasType == 'draw') ?
          this.renderContent() :
             this.renderScrollContent())
        }
        { this.renderButtons() }
      </View>
    )
  }
}

const mapStateToProps = ({core: {objects, answerData, auth}}, ownProps) => ({
  screen: (objects && objects[`folder/${ownProps.path}`][`item/${ownProps.name}`]) || {meta:{}},
  answers: answerData && answerData[ownProps.path],
  auth,
})

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(Screen)
