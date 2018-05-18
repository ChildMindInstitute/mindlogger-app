import React, {Component} from 'react';
import {StyleSheet, StatusBar, Image} from 'react-native';
import { Container, Content, Text, Button, View, Icon, Header, Left, Right, Title, Body, Thumbnail, Item } from 'native-base';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions } from 'react-native-router-flux';
import * as Progress from 'react-native-progress';

import randomString from 'random-string';
import { RNCamera } from 'react-native-camera';

import SurveyTextInput from '../../components/SurveyTextInput';
import SurveyBoolSelector from '../../components/SurveyBoolSelector';
import SurveySingleSelector from '../../components/SurveySingleSelector';
import SurveyMultiSelector from '../../components/SurveyMultiSelector';
import SurveyImageSelector from '../../components/SurveyImageSelector';
import DrawingBoard from '../../../drawing/components/DrawingBoard';
import { zeroFill } from '../../../../helper';

const styles=StyleSheet.create({
  body: {
    flex: 1,
  },
  box: {
    width: '100%',
    height: 360,
    position: 'relative',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  footerText: {
    fontSize: 20,
    fontWeight: '300',
  },
  flipButton: {
    position: 'absolute',
    bottom: 8,
    left: 8,
  },
  pickButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
});

export default class extends Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    this.setState({
      duration: 0,
      started: false,
    });
  }

  saveDrawing = () => {
    let result = this.board.save();
    this.props.onSave({
      result,
      time: Date.now(),
    });
    this.props.onNext();
  }

  resetDrawing = () => {
    this.board.reset();
  }

  onBack = () => {
    if (this.state.pic_source) {
      this.setState({pic_source: undefined})
    } else {
      this.props.onPrev();
    }
  }

  take = () => {
    if (this.state.pic_source) {
      this.savePhoto();
    } else {
      this.takePicture();
    }
  }

  beginDrawing() {
    const {question} = this.props;
    this.board.start();
    this.setState({started:true, duration:0});
    if(question.timer && question.timer>0)
        this.startTimer();
  }
  stopTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = undefined;
    }
    this.board.stop();
  }
  startTimer() {
    const {duration} = this.state;
    if(this.timerId) {
      clearInterval(this.timerId);
    }
    this.timerId = setInterval(() => {
      this.setState({duration: duration+1});
      if(duration>=this.props.question.timer) {
        this.stopTimer();
      }
    }, 1000);
  }

  take = () => {
    if (!this.state.started) {
      this.beginDrawing();
    } else {
      if (this.timerId) {
        this.stopTimer();  
      } else {
        this.saveDrawing();
      }
    }
  }

  render() {
    const { question, answer, onSave, onNext} = this.props;
    const {type, duration, pic_source, started} = this.state;
    let timeStr = zeroFill(Math.floor(duration/60), 2) + ':' + zeroFill(Math.floor(duration%60), 2);
    return (
      <View style={styles.body}>
        <Text>{question.title}</Text>
        <View style={styles.box}>
          <DrawingBoard source={question.image_url && {uri: question.image_url}} disabled={!started} ref={board => {this.board = board}} lines={answer && answer.lines}/>
          {question.timer && question.timer>0 && (<Progress.Bar progress={duration/question.timer} width={null} height={20}/>)}
          <Text style={styles.text}>{question.instruction}</Text>
          
        </View>
        <View style={styles.footer}>
          <Button transparent onPress={this.onBack}>
            {pic_source ? (<Text>REDO</Text>) : <Icon name="arrow-back" />}
          </Button>
          <Button onPress={this.take}><Text>{started ? (this.timerId ? timeStr : 'SAVE') : 'DRAW'} </Text></Button>
          <Button transparent onPress={onNext}><Text style={styles.footerText}>{ answer === undefined ? "SKIP" : "NEXT" }</Text></Button>
        </View>
      </View>
      );
  }
}
