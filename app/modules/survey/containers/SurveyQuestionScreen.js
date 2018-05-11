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

import baseTheme from '../../../theme';
import { saveAnswer } from '../../../actions/api';
import { setAnswer } from '../../../actions/coreActions';

import SurveyTextInput from '../components/SurveyTextInput'
import SurveyBoolSelector from '../components/SurveyBoolSelector'
import SurveySingleSelector from '../components/SurveySingleSelector'
import SurveyMultiSelector from '../components/SurveyMultiSelector'
import SurveyImageSelector from '../components/SurveyImageSelector'
import SurveyTableInput from '../components/SurveyTableInput'
import DrawingBoard from '../../drawing/components/DrawingBoard';
import AudioRecord from '../../../components/audio/AudioRecord';
import { uploadFileS3 } from '../../../helper';
import { openDrawer } from '../../../actions/drawer';

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
    marginRight: 20
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 15,
  },
  footerText: {
    fontSize: 20,
    fontWeight: '300',
  }
});
class SurveyQuestionScreen extends Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    this.setState({});
  }

  onInputAnswer = (result, data=undefined, final=false) => {
    let {questionIndex, survey:{questions}, answers, setAnswer} = this.props
    let answer = {
      result,
      time: (new Date()).getTime()
    }
    answers[questionIndex] = answer
    setAnswer({answers})
    if(final)
      setTimeout(() => { this.nextQuestion() }, 500)
  }
  saveChange = () => {
    let {questionIndex, survey} = this.props
    let answer;
    if(survey.mode == 'basic') {
      switch (survey.questions[questionIndex].type) {
        case 'drawing':
          answer = this.board.save();
          this.onInputAnswer(answer, null, false);
          break;
      }
    }
  }
  nextQuestion = () => {
    this.saveChange();
    let {questionIndex, survey, answers, indexMap} = this.props;
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
      Actions.replace("survey_question", {questionIndex, indexMap})
    } else {
      Actions.replace("survey_"+ survey.mode + "_summary")
    }
    
  }

  prevQuestion = () => {
    this.saveChange();
    let {questionIndex, survey:{questions}} = this.props
    let {answers} = this.props
    for(questionIndex=questionIndex-1; questionIndex>=0; questionIndex--)
    {
      let { condition_question_index, condition_choice } = questions[questionIndex];
      if (condition_question_index == undefined || condition_question_index == -1 || (answers[condition_question_index] && answers[condition_question_index].result == condition_choice)) {
        break;
      }
    }

    if(questionIndex>=0) {
      Actions.replace("survey_question", { questionIndex:questionIndex })
    } else {
      Actions.pop()
    }
  }

  renderHeader() {
    const { act, openDrawer } = this.props;
    return (<Header>
      <Left>
        <Button transparent onPress={openDrawer}>
          <Icon name="menu" />
        </Button>
      </Left>
      <Body style={{flex:2}}>
          <Title>{act.title}</Title>
      </Body>
      <Right>
      </Right>
    </Header>);
  }

  render() {
    const { questionIndex, survey, answers} = this.props;
    let question = survey.questions[questionIndex];
    let answer = answers[questionIndex] && answers[questionIndex].result;
    const length = survey.questions.length
    const index = questionIndex + 1
    const progressValue = index/length

    let scroll = true;
    let comp = (<View></View>);
    
    if(survey.mode == 'basic') {
      switch(question.type) {
        case 'text':
          comp = (<SurveyTextInput onSelect={this.onInputAnswer} data={{question, answer}} />);
          break;
        case 'bool':
          comp = (<SurveyBoolSelector onSelect={this.onInputAnswer} data={{question, answer}}/>);
          break;
        case 'single_sel':
          comp = (<SurveySingleSelector onSelect={this.onInputAnswer} data={{question, answer}}/>);
          break;
        case 'multi_sel':
          comp = (<SurveyMultiSelector onSelect={this.onInputAnswer} data={{question, answer}}/>);
          break;
        case 'image_sel':
          comp = (<SurveyImageSelector onSelect={this.onInputAnswer} data={{question, answer}}/>);
          break;
        case 'drawing':
          scroll = false;
          comp = (
          <View>
            <Text>{question.title}</Text>
            <DrawingBoard source={question.image_url && {uri: question.image_url}} ref={board => {this.board = board}} autoStart lines={answer && answer.lines}/>
            <View style={styles.row}>
              <Left><Button onPress={this.saveDrawing}><Text>Save</Text></Button></Left>
              <Right><Button onPress={this.resetDrawing}><Text>Reset</Text></Button></Right>
            </View>
          </View>);
          break;
        case 'audio':
          comp = (
            <View>
              <Text>{question.title}</Text>
              <AudioRecord onRecordFile={(filePath)=>this.onInputAnswer(filePath)} path={answer}/>
            </View>
          );
          break;
        case 'camera':
          comp = (<View>
            <Text>{question.title}</Text>
            <View>
                <Image source={this.state.pic_source} style={{width: null, height: 200, flex: 1, margin: 20}}/>
            </View>
            <View style={styles.row}>
              <Button onPress={this.pickPhoto}><Text>Select</Text></Button>
              <Button onPress={this.savePhoto} disabled={!this.state.pic_source}><Text>Save</Text></Button>
            </View>
          </View>)
          break;
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
      }
    } else {
      comp = (<SurveyTableInput onSelect={this.onInputAnswer} data={{question, answer}}/>);
    }

    return (
      <Container>
        { this.renderHeader() }
        <Content padder style={baseTheme.content} scrollEnabled={scroll}>
          <View padder style={{flexDirection:'row'}}>
            <Text style={styles.progressValue}>{`${index}/${length}`}</Text>
            <Progress.Bar style={{flexGrow: 1}} progress={progressValue} width={null} height={20}/>
          </View>
          {comp}
        </Content>
        <View style={styles.footer}>
          <Button transparent onPress={() => this.prevQuestion()}>
            <Icon name="arrow-back" />
          </Button>
          <Button transparent onPress={() => this.nextQuestion()}><Text style={styles.footerText}>{ answer === undefined ? "SKIP" : "NEXT" }</Text></Button>
        </View>
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
