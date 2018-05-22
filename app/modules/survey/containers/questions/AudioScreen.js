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

import AudioRecord from '../../../../components/audio/AudioRecord';
import {uploadFileS3} from '../../../../helper';
import WaveformWrapper from '../../../voice/components/WaveformWrapper';

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
    this.setState({duration:0, answer: {}})
  }

  onBack = () => {
    if (this.state.pic_source) {
      this.setState({answer: undefined})
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

  onRecordStart = (filePath) => {
    let {answer} = this.state;
    answer.output_path = undefined;
    this.setState({answer});
  }

  onRecordProgress = (duration) => {
    this.setState({duration});
  }

  onRecordFile = (output_path, duration) => {
    let answer = {output_path, duration};
    this.setState({answer});
    this.props.onSave({result: answer, time:Date.now()});
  }

  renderWaveForm(answer) {
    return (<WaveformWrapper
        source={{uri:`${answer.output_path}`}}
        waveFormStyle={{waveColor:'blue', scrubColor:'red'}}
        style={{
          height:40,
        }}
        duration = {answer.duration}
    >
    </WaveformWrapper>)
  }

  render() {
    const { question, onSave, onNext } = this.props;
    const { type, duration, started, answer } = this.state;
    let timeStr = zeroFill(Math.floor(duration/60), 2) + ':' + zeroFill(Math.floor(duration%60), 2);
    return (
      <View style={styles.body}>
        <Text>{question.title}</Text>
        <View style={styles.box}>
          <Text style={styles.text}>{question.instruction}</Text>
        </View>
        {/* {this.renderWaveForm(answer)} */}
        {question.timer && question.timer>0 && (<Progress.Bar progress={duration/question.timer} width={null} height={20}/>)}
        <View style={styles.footer}>
          <Button transparent onPress={this.onBack}>
            {answer ? (<Text>REDO</Text>) : <Icon name="arrow-back" />}
          </Button>
          <AudioRecord timeLimit={question.timer} mode="single" onStart={this.onRecordStart} onProgress={this.onRecordProgress} onRecordFile={this.onRecordFile}/>
          <Button transparent onPress={onNext}><Text style={styles.footerText}>{ answer === undefined ? "SKIP" : "NEXT" }</Text></Button>
        </View>
      </View>
      );
  }
}
