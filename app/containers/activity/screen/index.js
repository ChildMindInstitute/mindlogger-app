import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Content, Text, Button, Icon } from 'native-base';
import {
  Player,
  MediaStates
} from 'react-native-audio-toolkit';

import {randomLink} from '../../../helper';
import TextEntry from './TextEntry';
import ScreenButton from './ScreenButton';
import SurveySection from './survey';
import GImage from '../../../components/image/Image';

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
      validated: true
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

  setAnswer(data, validated, callback) {
    let {answer} = this.state;
    answer = {...answer, ...data};
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
  }

  getPayload(){
    const {path, screen} = this.props;
    const {meta: data={}} = screen;
    const {answer} = this.state;
    let payload = {'@id': path, data: answer};
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

  onSurvey = (survey, validated, next) => {
    let { length, index } = this.props;
    const {nextScreen} = this.state;

    const isFinal = (nextScreen || (index + 1)) >= length;
    if(next && !isFinal) {
      this.setAnswer({survey}, validated, () => {
        this.handleNext();
      });
    } else {
      this.setAnswer({survey}, validated);
    }
  }

  renderButtons() {
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

    // Configuration
    const permission = globalConfig.permission || {};
    const skippable = data.skippable == undefined ? permission.skip : data.skippable;
    const prevable = permission.prev;

    let buttonText = 'Take';
    const spinner = false;
    if ((!surveyType && !canvasType && !textEntry) || info) {
      if (length > 1)
        return (<View style={styles.footer}>
            <ScreenButton transparent onPress={this.handlePrev}><Icon name="md-arrow-back"/></ScreenButton>
            {isFinal ? <ScreenButton transparent onPress={this.handleNext} text={"Done"}/> : <ScreenButton transparent onPress={this.handleNext}><Icon name="md-arrow-forward"/></ScreenButton>}
        </View>);
      else 
        return (<View></View>)
    } else if (answer) {
      buttonText = 'Redo';
      return (<View style={styles.footer}>
        { prevable ? 
          <ScreenButton transparent onPress={this.handlePrev}><Icon name="md-arrow-back"/></ScreenButton>
          :
          <ScreenButton transparent/>
        }
        <ScreenButton onPress={this.handleReset} text={buttonText}/>
        {
          validated ? (
            isFinal ? <ScreenButton transparent onPress={this.handleNext} text={"Done"}/> : <ScreenButton transparent onPress={this.handleNext}><Icon name="md-arrow-forward"/></ScreenButton>
            )
            :
            <ScreenButton transparent/>
        }
      </View>);
    } else {
      return (<View style={styles.footer}>
        <ScreenButton transparent onPress={this.handlePrev}><Icon name="md-arrow-back"/></ScreenButton>
        { canvasType ? 
        (<ScreenButton onPress={this.handleAction} text={buttonText}>{spinner && <Spinner />}</ScreenButton>)
        :
        <ScreenButton transparent/>
        }
        { skippable ?
          <ScreenButton transparent onPress={this.handleSkip} text={isFinal ? "Done" : "Skip"}/>
          :
          <ScreenButton transparent/>
        }
      </View>);
    }
  }

  renderPicture(data) {
    return data.pictureVideo && data.pictureVideo.display && data.pictureVideo.files.length > 0 &&
      <GImage file={data.pictureVideo.files} style={{width: '100%', height: 200, resizeMode: 'cover'}} />
  }
  renderScrollContent() {
    let {screen: {meta: data}} = this.props;
    data = data || {};
    let hasAudio = data.audio && data.audio.display && data.audio.files.length>0;
    return (<Content style={{ flex: 1}}>
      {this.renderPicture(data)}
      <View style={styles.paddingContent}>
        {hasAudio && data.audio.playbackIcon && <Button transparent onPress={this.playAudio}><Icon name="volume-up" /></Button> }
        <Text style={styles.text}>{data.text}</Text>
        {
          data.surveyType && <SurveySection
            type={data.surveyType}
            config={data.survey}
            answer={this.answer('survey')}
            onChange={this.onSurvey}
            onNextChange={this.onNextChange}
            />
        }
        {
          data.textEntry && data.textEntry.display && 
          <TextEntry
            style={styles.text}
            config={data.textEntry}
            answer={this.answer('text')}
            onChange={text => this.setAnswer({text})}/>
        }
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
        <Text style={styles.text}>{data.text}</Text>
        {
          data.surveyType && <SurveySection
            type={data.surveyType}
            config={data.survey}
            answer={this.answer('survey')}
            onChange={this.onSurvey}
            onNextChange={this.onNextChange}
            />
        }
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
    return (
      <View style={{flex: 1, flexDirection: 'column'}}>
        {
          data && (
          data.surveyType == 'slider' ?
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
