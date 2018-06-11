import React, {Component} from 'react';
import {StyleSheet, StatusBar, Image, Platform} from 'react-native';
import { Container, Content, Text, Button, View, Icon, Header, Left, Right, Title, Body, Thumbnail, Item, Toast } from 'native-base';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions } from 'react-native-router-flux';
import * as Progress from 'react-native-progress';

import randomString from 'random-string';
import { RNCamera } from 'react-native-camera';
import moment from 'moment';

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
    let answer = this.props.answer && this.props.answer.result;
    this.setState({duration:0, answer});
  }

  onBack = () => {
    this.props.onPrev();
  }

  onSave = () => {
    const {question, onSave, onNext} = this.props;
    const {answer} = this.state;
    let filename = `${question.title}_VOICE_${moment().format('M-D-YYYY_HHmmss')}_${randomString({length:10})}`;
    filename = filename + (Platform.OS == 'android' ? '.mp3' : '.aac');
    uploadFileS3(answer.output_path, 'voices/', filename).then(output_url => {
      let result = { output_url, ...answer };
      onSave({result, time:Date.now()});
      onNext();
    }).catch(err => {
        Toast.show({text: err.message, position: 'bottom', type: 'danger', buttonText: 'ok'})
    })
    
  }

  onRecordStart = (filePath) => {
    this.setState({answer:{duration:0}});
  }

  onRecordProgress = (duration) => {
    this.setState({duration});
  }

  onRecordFile = (output_path, duration) => {
    let answer = {output_path, duration};
    this.setState({answer});
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
    console.log(answer);
    return (
      <View style={styles.body}>
        <Text>{question.title}</Text>
        <View style={styles.box}>
          <Text style={styles.text}>{question.instruction}</Text>
        </View>
        {answer && answer.output_path && this.renderWaveForm(answer)}
        {question.timer && question.timer>0 && (<Progress.Bar progress={duration/question.timer} width={null} height={20}/>)}
        <View style={styles.footer}>
          { (!answer || answer.output_url || this.props.answer) ?
            (<Button transparent onPress={this.onBack}>
              <Icon name="arrow-back" />
            </Button>)
            :
            (<Button transparent onPress={this.onReset}>
              <Text>Redo</Text>
            </Button>)
          }
          { !answer && <AudioRecord timeLimit={question.timer} mode="single" onStart={this.onRecordStart} onProgress={this.onRecordProgress} onRecordFile={this.onRecordFile}/> }
          { (answer && !answer.output_url) && (<Button onPress={this.onSave}><Text>SAVE</Text></Button>) }
          <Button transparent onPress={onNext}>{ !this.props.answer ? (<Text style={styles.footerText}>SKIP</Text>) : <Icon name="arrow-forward" /> }</Button>
        </View>
      </View>
      );
  }
}
