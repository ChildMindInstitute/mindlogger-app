import React, {Component} from 'react';
import {StyleSheet, StatusBar, Image} from 'react-native';
import { Container, Content, Text, Button, View, Icon, Header, Left, Right, Title, Body, Thumbnail, Item } from 'native-base';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions } from 'react-native-router-flux';
import * as Progress from 'react-native-progress';

import ImagePicker from 'react-native-image-picker';
import { Accelerometer } from 'react-native-sensors';
import SortableGrid from 'react-native-sortable-grid';
import randomString from 'random-string';
import { RNCamera } from 'react-native-camera';

import baseTheme from '../../../theme';
import { saveAnswer } from '../../../actions/api';
import { setAnswer } from '../../../actions/coreActions';

import QuestionScreen from './questions/QuestionScreen';
import ActHeader from '../../../components/header';
import { uploadFileS3 } from '../../../helper';
import { openDrawer } from '../../../actions/drawer';
import CameraScreen from './questions/CameraScreen';
import DrawingScreen from './questions/DrawingScreen';
import AudioScreen from './questions/AudioScreen';

const styles=StyleSheet.create({
  row: {
    flexDirection:'row',
    justifyContent:'space-around'
  },
  block: {
    flex: 1,
    margin: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  progressValue: {
    textAlign:'center',
    marginRight: 20,
    fontSize: 12,
  },
  progress: {
    alignItems: 'center',
    flexDirection: 'row',
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
  camera: {
    height: 300,
    width: '100%',
  }
});
class SurveyQuestionScreen extends Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    this.setState({questionIndex: this.props.questionIndex});
  }

  save = (answer) => {
    let {survey:{questions}, answers, setAnswer} = this.props;
    answers[this.state.questionIndex] = answer;
    setAnswer({answers});
  }

  next = () => {
    let {survey, answers, indexMap} = this.props;
    let {questionIndex} = this.state;
    let {questions} = survey;
    let condition_question_index, condition_choice;
    // Skip question does not match condition
    do {
      questionIndex = questionIndex + 1
      if (questionIndex<questions.length) {
        condition_question_index = questions[questionIndex].condition_question_index;
        condition_choice = questions[questionIndex].condition_choice;
      } else {
        break;
      }
    }while(condition_question_index>-1 && answers[condition_question_index].result != condition_choice);

    if(questionIndex<questions.length) {
      this.setState({questionIndex, indexMap});
    } else {
      Actions.replace("survey_"+ survey.mode + "_summary");
    }
    
  }

  prev = () => {
    let {answers, survey:{questions}} = this.props;
    let {questionIndex} = this.state;
    for(questionIndex=questionIndex-1; questionIndex>=0; questionIndex--)
    {
      let { condition_question_index, condition_choice } = questions[questionIndex];
      if (condition_question_index == undefined || condition_question_index == -1 || (answers[condition_question_index] && answers[condition_question_index].result == condition_choice)) {
        break;
      }
    }

    if(questionIndex>=0) {
      this.setState({questionIndex});
    } else {
      Actions.pop();
    }
  }

  renderContent() {
    const { survey, answers, act} = this.props;
    const {questionIndex} = this.state;
    let question = survey.questions[questionIndex];
    let answer = answers[questionIndex];
    let comp = (<View></View>);
    if(survey.mode == 'basic') {
      switch(question.type) {
        case 'drawing':
          return <DrawingScreen key={questionIndex} question={question} answer={answer} onPrev={this.prev} onNext={this.next} onSave={this.save} />
        case 'audio':
          return <AudioScreen key={questionIndex} question={question} answer={answer} onPrev={this.prev} onNext={this.next} onSave={this.save} />
          break;
        case 'camera':
          return (<CameraScreen key={questionIndex} question={question} answer={answer} onPrev={this.prev} onNext={this.next} onSave={this.save}/>)
        case 'capture_acc':
          comp = (<View>
            <Text>{question.title}</Text>
            <View style={styles.row}>
              <Left><Button onPress={this.recordAcc}><Text>Record</Text></Button></Left>
              <Right><Button onPress={this.saveAcc}><Text>Save</Text></Button></Right>
            </View>
          </View>)
          break;
        case 'image_sort':
          comp = (<View>
            <Text>{question.title}</Text>
            {this.renderImageSort(question)}
            <View style={styles.row}>
              <Right><Button onPress={this.saveAcc}><Text>Save</Text></Button></Right>
            </View>
            </View>)
          break;
        default:
          return (<QuestionScreen key={questionIndex} question={question} answer={answer} onPrev={this.prev} onNext={this.next} onSave={this.save}/>)
      }
    } else {
      comp = (<SurveyTableInput key={questionIndex} onSelect={this.onInputAnswer} data={{question, answer}}/>);
    }
  }
  render() {
    const { survey, answers, act} = this.props;
    const {questionIndex} = this.state;
    const length = survey.questions.length;
    const index = questionIndex + 1;
    const progressValue = index/length;
    return (
      <Container>
        <StatusBar barStyle='light-content'/>
        <ActHeader title={act.title} />
        <View padder style={styles.progress}>
          <Text style={styles.progressValue}>{`${index}/${length}`}</Text>
          <Progress.Bar style={{flexGrow: 1}} progress={progressValue} width={null} height={12}/>
        </View>
        { this.renderContent()}
      </Container>
      );
  }

  saveDrawing = () => {
    let answer = this.board.save();
    this.onInputAnswer(answer, null, true);
  }

  pickPhoto = () => {
    let options = {title: 'Select Image'}
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('Image Picker error: ', response.error);
      } else {
        let pic_source = {uri: response.uri, filename: response.fileName};
        this.setState({pic_source})
      }
    })
  }

  savePhoto = () => {
    let {uri, filename} = this.state.pic_source;
    let timestamp = Math.floor(Date.now());
    filename = `${timestamp}_${randomString({length:20})}_`+filename;
    uploadFileS3(uri, 'uploads/', filename).then(url => {
      this.onInputAnswer(url, null, true);
    })
  }

  recordAcc = () => {
    this.accObservable = null;
    this.accData=[];
    let acc = new Accelerometer().then(observable => {
      this.accObservable = observable;
      this.accObservable
        .map(({x,y,z}) => x+y+z)
        .filter(speed => speed > 20)
        .subscribe(speed => this.accData.push({speed, time: Date.now()}))
    })
  }

  saveAcc = () => {
    if(!this.accObservable) return;
    this.accObservable.stop();
    this.onInputAnswer(this.accData, null, true);
    this.accObservable = null;
  }

  renderImageSort(question) {
    let {images} = question;
    return (
      <SortableGrid>
        {
          images.map((item, index) => <Thumbnail key={index} style={styles.block} source={{uri: item.image_url}}/>)
        }
        
      </SortableGrid>
    )
  }
}

export default connect(state => ({
    act: state.core.act,
    survey: state.core.act.act_data,
    answers: state.core.answer && state.core.answer.answers || [],
  }),
  (dispatch) => bindActionCreators({saveAnswer, setAnswer, openDrawer}, dispatch)
)(SurveyQuestionScreen);
