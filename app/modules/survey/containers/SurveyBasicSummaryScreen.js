import React, {Component} from 'react';
import {StyleSheet, StatusBar, ListView} from 'react-native';
import { Container, Content, Text, Button, View, Icon, ListItem, Body, List, Header, Right, Left, Title, H1, Thumbnail } from 'native-base';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions } from 'react-native-router-flux';
import Collapsible from 'react-native-collapsible';

import baseTheme from '../../../theme'
import * as surveyActions from '../actions'
import {fbSaveAnswer} from '../../../firebase'

import SurveyTextInput from '../components/SurveyTextInput'
import SurveyBoolSelector from '../components/SurveyBoolSelector'
import SurveySingleSelector from '../components/SurveySingleSelector'
import SurveyMultiSelector from '../components/SurveyMultiSelector'

class SurveyBasicSummaryScreen extends Component {
  constructor(props) {
    super(props) 
  }
  componentWillMount() {
  }
  onSelect(questionIndex) {
    Actions.replace("survey_question", { questionIndex })
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
      <Content padder style={baseTheme.content}>
        <H1 style={{textAlign:'center'}}>Responses</H1>
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
 
  _renderRow = (idx, question, answer) => {
    let style = baseTheme.enabledColor
    let rowItem
    if(answer === undefined) {
      style = baseTheme.disabledColor
      rowItem = <Text></Text>
    } else {
      switch(question.type) {
        case 'bool':
          rowItem = <Text>{answer ? "True":"False"}</Text>
          break;
        case 'single_sel':
          rowItem = <Text>{question.rows[answer].text}</Text>
          break;
        case 'multi_sel':
          rowItem = <Text>{(answer.map((item, idx) => question.rows[item].text )).join(", ")}</Text>
          break;
        case 'image_sel':
          rowItem = (<Thumbnail square source={{uri: question.images[answer].image_url}} />)
          break;
        default:
          answerText = <Text>{answer}</Text>
          break;
      }
    }
    
    return (
      <ListItem key={idx} onPress={() => { this.onSelect(idx)}}>
        <Body>
          <Text style={style}>{question.title}</Text>
        </Body>
        <Right>
          {rowItem}
        </Right>
      </ListItem>
    );
  }
}

export default connect(state => ({
  survey: state.survey.survey_in_action,
}),
  (dispatch) => bindActionCreators(surveyActions, dispatch)
)(SurveyBasicSummaryScreen);
