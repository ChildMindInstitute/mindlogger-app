import React, {Component} from 'react';
import {StyleSheet, StatusBar, ListView} from 'react-native';
import { Container, Content, Text, Button, View, Icon, ListItem, Body, List, Header, Right, Left, Title } from 'native-base';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions } from 'react-native-router-flux';
import Collapsible from 'react-native-collapsible';

import baseTheme from '../../../theme'
import * as surveyActions from '../actions'
import {fbSaveAnswer} from '../../../helper'

import SurveyTextInput from '../components/SurveyTextInput'
import SurveyBoolSelector from '../components/SurveyBoolSelector'
import SurveySingleSelector from '../components/SurveySingleSelector'
import SurveyMultiSelector from '../components/SurveyMultiSelector'

class SurveyAccordionScreen extends Component {
  constructor(props) {
    super(props) 
    this.lastIdx = -1
  }
  componentWillMount() {
    this.setState({expand:{}})
  }
  onDone() {
    fbSaveAnswer(this.props.survey)
    Actions.pop()
  }
  render() {
    const {survey} = this.props
    const {questions, answers} = survey
    return (
      <Container>
      <Header>
        <Left>
            <Button transparent onPress={() => Actions.pop()}>
            <Icon name="arrow-back" />
            </Button>
        </Left>
        <Body style={{flex:2}}>
            <Title>{survey.title}</Title>
        </Body>
        <Right/>
      </Header>
      <Content style={baseTheme.content}>
      <List>
      {
        questions.map((question, idx) => this._renderRow(idx, question, answers[idx]))
      }
      </List>
      <Button block full onPress={() => this.onDone()}><Text>Done</Text></Button>
      </Content>
      </Container>
    );
  }

  onExpand = (idx) => {
    let {expand} = this.state
    if(this.lastIdx && this.lastIdx != idx)
      expand[this.lastIdx] = false
    expand[idx] = !expand[idx]
    this.lastIdx = idx
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
        <Text style={style}>{question.title}</Text>
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

  onInputAnswer = (result, data, final) => {
    questionIndex = data.index
    let {survey, setSurvey} = this.props
    let {questions, answers} = survey
    if(answers.length > questionIndex) {
      answers[questionIndex] = result
    } else {
      answers.push(result)
    }
    setSurvey({...survey, answers})
    if(final)
      setTimeout(() => {this.onExpand(questionIndex)}, 500)
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
  survey: state.survey.survey_in_action,
}),
  (dispatch) => bindActionCreators(surveyActions, dispatch)
)(SurveyAccordionScreen);
