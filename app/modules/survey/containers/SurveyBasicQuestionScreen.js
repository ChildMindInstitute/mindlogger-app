import React, {Component} from 'react';
import {StyleSheet, StatusBar} from 'react-native';
import { Container, Content, Text, Button, View, Icon, Header, Left, Right, Title, Body } from 'native-base';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions } from 'react-native-router-flux';
import * as Progress from 'react-native-progress';

import baseTheme from '../../../theme'
import {setSurvey} from '../actions'

import SurveyTextInput from '../components/SurveyTextInput'
import SurveyBoolSelector from '../components/SurveyBoolSelector'
import SurveySingleSelector from '../components/SurveySingleSelector'
import SurveyMultiSelector from '../components/SurveyMultiSelector'

class SurveyBasicQuestionScreen extends Component {
  constructor(props) {
    super(props)
    
  }

  onInputAnswer = (result) => {
    let {questionIndex, survey, setSurvey} = this.props
    let {questions, answers} = survey
    if(answers.length > questionIndex) {
      answers[questionIndex] = result
    } else {
      answers.push(result)
    }
    setSurvey({...survey, answers})
    this.nextQuestion()
  }

  nextQuestion = () => {
    let {questionIndex, survey, setSurvey} = this.props
    let {questions, answers} = survey
    questionIndex = questionIndex + 1
    if(questionIndex<questions.length) {
      Actions.replace("survey_question", { questionIndex:questionIndex})
    } else {
      Actions.replace("survey_question_summary")
    }
  }

  prevQuestion = () => {
    let {questionIndex, survey, setSurvey} = this.props
    let {questions, answers} = survey
    questionIndex = questionIndex - 1
    if(questionIndex>=0) {
      Actions.replace("survey_question", { questionIndex:questionIndex })
    } else {
      Actions.pop()
    }
  }

  renderQuestion() {
    const { questionIndex, survey } = this.props
    let question = survey.questions[questionIndex]
    let answer = survey.answers[questionIndex]
    const { type } = question
    switch(type) {
      case 'text':
        return (<SurveyTextInput onSelect={this.onInputAnswer} data={{question, answer}} />)
      case 'bool':
        return (<SurveyBoolSelector onSelect={this.onInputAnswer} data={{question, answer}}/>)
      case 'single_sel':
        return (<SurveySingleSelector onSelect={this.onInputAnswer} data={{question, answer}}/>)
      case 'multi_sel':
        return (<SurveyMultiSelector onSelect={this.onInputAnswer} data={{question, answer}}/>)
    }
    return (
      <View>
      </View>
      )

  }

  render() {
    const { questionIndex, survey } = this.props
    const length = survey.questions.length
    const index = questionIndex + 1
    const progressValue = index/length
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
        { this.renderQuestion()}
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
    survey: state.survey.survey_in_action,
  }),
  (dispatch) => bindActionCreators({setSurvey}, dispatch)
)(SurveyBasicQuestionScreen);
