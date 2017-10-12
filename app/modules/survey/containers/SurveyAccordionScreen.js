import React, {Component} from 'react';
import {StyleSheet, StatusBar, ListView} from 'react-native';
import { Container, Content, Text, Button, View, Icon, ListItem, Body, List, Header, Right } from 'native-base';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions } from 'react-native-router-flux';
import Collapsible from 'react-native-collapsible';


import baseTheme from '../../../theme'
import * as surveyActions from '../actions'

import SurveyTextInput from '../components/SurveyTextInput'
import SurveyBoolSelector from '../components/SurveyBoolSelector'
import SurveySingleSelector from '../components/SurveySingleSelector'
import SurveyMultiSelector from '../components/SurveyMultiSelector'

class SurveyAccordionScreen extends Component {
  constructor(props) {
    super(props) 
  }
  componentWillMount() {
    this.setState({expand:{}})
  }
  render() {
    const {questions, answers} = this.props
    console.log(baseTheme)
    return (
      <Container>
      <Header />
      <Content style={baseTheme.content}>
      <List>
      {
        questions.map((question, idx) => this._renderRow(idx, question, answers[idx]))
      }
      </List>
      </Content>
      </Container>
    );
  }

  onExpand = (idx) => {
    let {expand} = this.state
    expand[idx] = !expand[idx]
    this.setState({expand})
  }
 
  _renderRow = (idx, question, answer) => {
    let {expand} = this.state
    let style = baseTheme.enabledColor
    if(answer === undefined) {
      style = baseTheme.disabledColor
    }
    var header = (
      <ListItem onPress={() => { this.onExpand(idx)}}>
        <Body>
        <Text style={style}>{question.text}</Text>
        </Body>
        <Right>
        </Right>
      </ListItem>
    );
    var content = (
      <Collapsible style={baseTheme.paddingView} collapsed={!(expand[idx])}>
        {this.renderQuestion(question, answer, {index: idx})}
      </Collapsible>
    );
 
    return (
      <View key={idx}>
      {header}
      {content}
      </View>
    );
  }

  onInputAnswer = (answer, data) => {
    this.props.postAnswer(data.index, answer)
    this.onExpand(data.index)
  }

  renderQuestion(question, answer, data) {
    const { type } = question
    console.log(question)
    param = {
      question,
      answer,
      ...data
    }
    switch(type) {
      case 'text':
        return (<SurveyTextInput onSelect={this.onInputAnswer} data={param} disableHeader/>)
      case 'bool':
        return (<SurveyBoolSelector onSelect={this.onInputAnswer} data={param} disableHeader/>)
      case 'single_sel':
        return (<SurveySingleSelector onSelect={this.onInputAnswer} data={param} disableHeader/>)
      case 'multi_sel':
        return (<SurveyMultiSelector onSelect={this.onInputAnswer} data={param} disableHeader/>)
    }
    return (
      <View>
      </View>
      )

  }
}

export default connect(state => ({
    questions: state.survey && state.survey.questions.sample1,
    answers: state.survey && state.survey.answers
  }),
  (dispatch) => bindActionCreators(surveyActions, dispatch)
)(SurveyAccordionScreen);
