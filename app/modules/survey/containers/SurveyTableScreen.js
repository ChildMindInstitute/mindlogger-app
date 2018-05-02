import React, {Component} from 'react';
import {StyleSheet, StatusBar} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions } from 'react-native-router-flux';
import { Container, Content, Text, Button, View, Icon, Body, Header, Right, Left, Title, H1, Row } from 'native-base';
import * as Progress from 'react-native-progress';

import baseTheme from '../../../theme'
import { setAnswer } from '../../../actions/coreActions';

import SurveyTableInput from '../components/SurveyTableInput'

class SurveyTableScreen extends Component {
  constructor(props) {
    super(props)
    
  }

  onInputAnswer = (result, data, final = false) => {
    let {questionIndex, survey, setAnswer, answers} = this.props
    let {questions} = survey
    let answer = {
      result,
      time: (new Date()).getTime()
    }
    answers[questionIndex] = answer
    setAnswer({answers})
    if(final)
      this.nextQuestion()
  }

  nextQuestion = () => {
    let {questionIndex, survey, setAnswer} = this.props
    let {questions} = survey
    questionIndex = questionIndex + 1
    if(questionIndex<questions.length) {
      Actions.replace("survey_table_question", { questionIndex:questionIndex})
    } else {
      Actions.replace("survey_table_summary")
    }
  }

  prevQuestion = () => {
    let {questionIndex, survey} = this.props
    let {questions} = survey
    questionIndex = questionIndex - 1
    if(questionIndex>=0) {
      Actions.replace("survey_table_question", { questionIndex:questionIndex })
    } else {
      Actions.pop()
    }
  }

  render() {
    const { questionIndex, survey, answers } = this.props
    const length = survey.questions.length
    const index = questionIndex + 1
    const progressValue = index/length
    let data = {question: survey.questions[questionIndex], answer: answers[questionIndex] && answers[questionIndex].result}
    return (
      <Container>
      <Header>
        <Left>
          <Button transparent onPress={() => this.prevQuestion()}>
          <Icon name="arrow-back" />
          </Button>
        </Left>
        <Body style={{flex:2}}>
            <Title>{survey.title}</Title>
        </Body>
        <Right>
          <Button transparent onPress={() => this.nextQuestion()}>
          <Icon name="arrow-forward" />
          </Button>
        </Right>
      </Header>
      <Content padder style={baseTheme.content}>
        <SurveyTableInput onSelect={this.onInputAnswer} data={data}/>
        <View padder style={{marginTop: 20}}>
          <Progress.Bar progress={progressValue} width={null} height={20}/>
          <Text style={{textAlign:'center'}}>{`${index}/${length}`}</Text>
        </View>
      </Content>
      </Container>
    )
  }
}

export default connect(state => ({
    survey: state.core.act.act_data,
    answers: state.core.answer && state.core.answer.answers || [],
  }),
  (dispatch) => bindActionCreators({setAnswer}, dispatch)
)(SurveyTableScreen);
