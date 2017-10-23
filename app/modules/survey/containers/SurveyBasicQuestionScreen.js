import React, {Component} from 'react';
import {StyleSheet, StatusBar} from 'react-native';
import { Container, Content, Text, Button, View, Icon, Header } from 'native-base';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions } from 'react-native-router-flux';


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
    Actions.survey_question({ questionIndex:questionIndex+1})
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

  renderButtons() {
    const {questionIndex} = this.props
    return (
      <View style={baseTheme.spacedRow}>
      <Button onPress={() => Actions.pop()} iconLeft transparent  small bordered>
        <Icon name='arrow-back' />
        <Text>Back</Text>
      </Button>
      <Button onPress={() => Actions.survey_question({ questionIndex:questionIndex+1})} iconRight transparent small bordered>
        <Text>Next</Text>
        <Icon name='arrow-forward' />
      </Button>
      </View>
      )
  }

  render() {
    return (
      <Container>
      <Header />
      <Content style={baseTheme.content}>
      <View style={baseTheme.paddingView}>
      {this.renderButtons()}
      </View>
      { this.renderQuestion()}
      
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
