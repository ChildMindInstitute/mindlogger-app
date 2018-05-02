import React, {Component} from 'react';
import {StyleSheet, StatusBar, ListView} from 'react-native';
import { Container, Content, Text, Button, View, Icon, ListItem, Body, List, Header, Right, Left, Title } from 'native-base';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions } from 'react-native-router-flux';
import Collapsible from 'react-native-collapsible';

import { saveAnswer } from '../../../actions/api';
import { setAnswer } from '../../../actions/coreActions';
import baseTheme from '../../../theme'
import * as surveyActions from '../actions'

import SurveyTableInput from '../components/SurveyTableInput'

class SurveyTableAccordionScreen extends Component {
  constructor(props) {
    super(props) 
  }
  componentWillMount() {
    this.setState({expand:{}})
  }
  onDone() {
    const {saveAnswer, act, answers, survey} = this.props
    saveAnswer(act.id, survey, {answers}).then(res => {
      Actions.pop()
    }).catch(err => {
      Toast.show({text: 'Error! '+err.message, type: 'danger', buttonText: 'OK' })
    })
  }
  render() {
    const {act, survey:{questions}, answers} = this.props
    return (
      <Container>
      <Header>
        <Left>
            <Button transparent onPress={() => Actions.pop()}>
            <Icon name="arrow-back" />
            </Button>
        </Left>
        <Body style={{flex:2}}>
            <Title>{act.title}</Title>
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
    if(answer !== undefined) {
      style = {color: '#ccc'}
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
        {this.renderQuestion(question,answer && answer.result, {index: idx})}
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
    let {survey:{questions}, answers, setAnswer} = this.props
    let answer = {
      result,
      time: (new Date()).getTime()
    }
    answers[questionIndex] = answer
    setAnswer({answers})
  }

  renderQuestion(question, answer, data) {
    const { type } = question
    param = {
      question,
      answer,
      ...data
    }
    return (
      <SurveyTableInput disableHeader onSelect={this.onInputAnswer} data={param}/>
      )
  }
}

export default connect(state => ({
  act: state.core.act,
  survey: state.core.act.act_data,
  answers: state.core.answer && state.core.answer.answers || [],
}),
  (dispatch) => bindActionCreators({saveAnswer, setAnswer}, dispatch)
)(SurveyTableAccordionScreen);
