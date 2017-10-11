import React, {Component} from 'react';
import {StyleSheet, StatusBar} from 'react-native';
import { Container, Content, Text, Button, View, Icon, Header } from 'native-base';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions } from 'react-native-router-flux';


import baseTheme from '../../../theme'
import * as surveyActions from '../actions'

import SurveyToggleSelector from '../components/SurveyToggleSelector'

class SurveyTableScreen extends Component {
  constructor(props) {
    super(props)
    
  }

  onInputAnswer = (result) => {
    const {questionIndex} = this.props
    this.props.postAnswer(questionIndex, result)
    Actions.survey_table({ questionIndex:questionIndex+1})
  }

  renderQuestion() {
    const { questionIndex, questions, answers } = this.props
    let question = questions[questionIndex]
    let answer = answers[questionIndex]
    const { type } = question
    console.log(question)
    switch(type) {
      case 'multi_sel':
        return (<SurveyToggleSelector onSelect={this.onInputAnswer} data={{question, answer}}/>)
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
      <Button onPress={() => Actions.survey_table({ questionIndex:questionIndex+1})} iconRight transparent small bordered>
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
    questions: state.survey && state.survey.questions,
    answers: state.survey && state.survey.answers
  }),
  (dispatch) => bindActionCreators(surveyActions, dispatch)
)(SurveyTableScreen);
