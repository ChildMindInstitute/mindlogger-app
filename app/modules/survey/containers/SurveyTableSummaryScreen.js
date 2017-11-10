import React, {Component} from 'react';
import {StyleSheet, StatusBar, ListView} from 'react-native';
import { Container, Content, Text, Button, View, Icon, ListItem, Body, List, Header, Right, Left, Title, H1 } from 'native-base';
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

class SurveyTableSummaryScreen extends Component {
  constructor(props) {
    super(props) 
  }
  componentWillMount() {
    const {questions, answers} = this.survey
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2, sectionHeaderHasChanged: (s1,s2) => s1 !==s2 });
    let data = {}
    questions.forEach((question, idx) => {
      data[idx] = answers[idx]
    })
    ds.cloneWithRowsAndSections(answers)
  }

  _renderRow = (data, secId, rowId) => {
    const {questions, answers} = this.survey
    let answer = answers[secId]
    let question = questions[secId]
    return (<View>{question.rows[rowId].text}: {answer[rowId]}</View>)
  }
  onSelect(questionIndex) {
    Actions.replace("survey_question", { questionIndex })
  }

  onDone() {
    fbSaveAnswer(this.props.survey)
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
      <Content padder style={baseTheme.content}>
        <H1 style={{textAlign:'center'}}>Responses</H1>
        <List
          dataSource={ds.cloneWithRowsAndSections()}
          renderRow={this._renderRow}
          renderSectionHeader={this._renderSectionHeader}
          enableEmptySections
        />
        <Button block full onPress={() => this.onDone()}><Text>Done</Text></Button>
      </Content>
      </Container>
    );
  }
 
  _renderRow = (idx, question, answer) => {
    let style = baseTheme.enabledColor
    if(answer === undefined) {
      style = baseTheme.disabledColor
    }
    let answerText = answer
    switch(question.type) {
      case 'bool':
        answerText = answer ? "True":"False"
        break;
      case 'single_sel':
        answerText = question.rows[answer].text
        break;
      case 'multi_sel':
        answerText = (answer.map((item, idx) => question.rows[item].text )).join(", ")
        break;
      default:
        answerText = answer
        break;
    }
    console.log(answer, answerText)
    return (
      <ListItem key={idx} onPress={() => { this.onSelect(idx)}}>
        <Body>
        <Text style={style}>{question.title}</Text>
        </Body>
        <Right>
        <Text>
        {answerText}
        </Text>
        </Right>
      </ListItem>
    );
  }
}

export default connect(state => ({
  survey: state.survey.survey_in_action,
}),
  (dispatch) => bindActionCreators(surveyActions, dispatch)
)(SurveyTableSummaryScreen);
