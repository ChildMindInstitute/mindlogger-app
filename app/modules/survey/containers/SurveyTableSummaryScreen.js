import React, {Component} from 'react';
import {StyleSheet, StatusBar, ListView} from 'react-native';
import { Toast, Container, Content, Text, Button, View, Icon, ListItem, Body, List, Header, Right, Left, Title, H1, Separator, Thumbnail } from 'native-base';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions } from 'react-native-router-flux';
import Collapsible from 'react-native-collapsible';

import baseTheme from '../../../theme'
import * as surveyActions from '../actions'
import { saveAnswer } from '../../../actions/api';

import SurveyTextInput from '../components/SurveyTextInput'
import SurveyBoolSelector from '../components/SurveyBoolSelector'
import SurveySingleSelector from '../components/SurveySingleSelector'
import SurveyMultiSelector from '../components/SurveyMultiSelector'

class SurveyTableSummaryScreen extends Component {
  constructor(props) {
    super(props) 
  }
  componentWillMount() {
    
  }

  _renderRowAndSection = (row, idx) => {
    const {secId, rowId, text, answer} = row
    if(rowId === undefined) {
      return (<Separator key={idx} bordered onPress={() => this.onSelect(secId)}><Text>{text}</Text></Separator>)
    } else {
      const {questions} = this.props.survey
      const question = questions[row.secId]
      if(answer === undefined || answer == null) {
        return (<ListItem key={idx} onPress={() => this.onSelect(secId)}><Left><Text>{text}:</Text></Left><Body></Body></ListItem>)
      }
      switch(question.type)
      {
        case 'image_sel':
          return (<ListItem key={idx} onPress={() => this.onSelect(secId)}><Left><Text>{text}:</Text></Left><Body>{answer!==undefined ? (<Thumbnail square source={{uri: question.cols[answer].image_url}}/>) : <Text></Text>}</Body></ListItem>)
        case 'single_sel':
          return (<ListItem key={idx} onPress={() => this.onSelect(secId)}><Left><Text>{text}:</Text></Left><Body><Text>{question.cols[answer].text}</Text></Body></ListItem>)
        case 'multi_sel':
          result = []
          answer.forEach((item, index) => item && result.push(question.cols[index].text))
          return (<ListItem key={idx} onPress={() => this.onSelect(secId)}><Left><Text>{text}:</Text></Left><Body><Text>{result.join(", ")}</Text></Body></ListItem>)
        case 'text':
          return (<ListItem key={idx} onPress={() => this.onSelect(secId)}><Left><Text>{text}:</Text></Left><Body><Text>{answer.map((text, index) => `${question.cols[index].text}(${text})`).join(", ")}</Text></Body></ListItem>)
        default:
          return (<ListItem key={idx} onPress={() => this.onSelect(secId)}><Left><Text>{text}:</Text></Left><Body><Text>{answer.join(", ")}</Text></Body></ListItem>)
      }
        
    }
  }
  onSelect(questionIndex) {
    Actions.replace("survey_table_question", { questionIndex })
  }

  onDone() {
    const {saveAnswer, act, answer, survey} = this.props
    saveAnswer(act.id, survey, answer).then(res => {
      Actions.pop()
    }).catch(err => {
      Toast.show({text: 'Error! '+err.message, type: 'danger', buttonText: 'OK' })
    })
  }
  
  render() {
    const {act, survey:{questions}, answers} = this.props
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2, sectionHeaderHasChanged: (s1,s2) => s1 !==s2 });
    let dRows = []
    questions.forEach((question, secId) => {
      dRows.push({secId, text:question.title})
      question.rows.forEach((row, rowId) => {
        const answer = answers[secId]
        dRows.push({secId, rowId, text: row.text, answer: answer && answer.result[rowId] })
      })
    })
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
      <Content padder style={baseTheme.content}>
        <H1 style={{textAlign:'center'}}>Responses</H1>
        <List>
          { dRows.map( (row, idx) => this._renderRowAndSection(row, idx) )}
        </List>
        <Button block full onPress={() => this.onDone()}><Text>Done</Text></Button>
      </Content>
      </Container>
    );
  }
}

export default connect(state => ({
  act: state.core.act,
  survey: state.core.act.act_data,
  answers: state.core.answer && state.core.answer.answers || [],
}),
  (dispatch) => bindActionCreators({saveAnswer}, dispatch)
)(SurveyTableSummaryScreen);
