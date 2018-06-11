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
    padding: 20,
  },
  box: {
    width: '100%',
    flexGrow: 1,
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
    if(this.timerId)
      this.stopTimer();
    this.board.reset();
    this.setState({
      duration: 0,
      started: false,
    });
  }

  onBack = () => {
    this.props.onPrev();
  }
  beginDrawing() {
    const {question} = this.props;
    this.board.start();
    this.setState({started:true, duration:0});
    this.startTimer();
  }
  stopTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = undefined;
    }
    this.setState({started: false});
    this.board.stop();
  }
  startTimer() {
    const {timer} = this.props.question;
    if(this.timerId) {
      clearInterval(this.timerId);
    }
    this.timerId = setInterval(() => {
      const {duration} = this.state;
      this.setState({duration: duration+1});
      if(timer && duration>=timer) {
        this.stopTimer();
      }
    }, 1000);
  }

  toggle = () => {
    const {started, duration} = this.state;
    if (!this.state.started) {
        this.beginDrawing();
    } else {
      this.stopTimer();  
    }
  }
  componentWillUnmount() {
    this.stopTimer();
  }

  render() {
    const { question, onSave, onNext} = this.props;
    const answer = this.props.answer && this.props.answer.result;
    const {type, duration, started} = this.state;
    const hasDraw = duration>0 || started;
    
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
          { (answer || !hasDraw) ?
            (<Button transparent onPress={this.onBack}>
              <Icon name="arrow-back" />
            </Button>) 
            :
            (<Button transparent onPress={this.resetDrawing}>
              <Text>REDO</Text>
            </Button>)
          }
          { answer == undefined &&
            (
              (duration>0 && !started) ?
              (<Button onPress={this.saveDrawing}><Text>SAVE</Text></Button>)
              :
              (<Button onPress={this.toggle}><Text>{this.timerId ? timeStr : 'DRAW'}</Text></Button>)
            )
          }
          <Button transparent onPress={onNext}>{ answer == undefined ? (<Text style={styles.footerText}>SKIP</Text>) : (<Icon name="arrow-forward" />) }</Button>
        </View>
      </View>
      );
  }
}
