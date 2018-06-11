import React, { Component } from 'react';
import { StyleSheet, StatusBar, ListView } from 'react-native';
import { Container, Content, Text, Button, View, Icon, Item, Body, List, Header, Right, Left, Title, H1, Thumbnail } from 'native-base';
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

const styles=StyleSheet.create({
  view: {
    padding: 10,
  },
  item: {
    padding: 10,
  },
  doneButton: {
    marginTop: 20,
  }
});
class SurveyBasicSummaryScreen extends Component {
  constructor(props) {
    super(props);
  }
  componentWillMount() {
    const { survey: { questions }, answer: { answers } } = this.props;
    let indexArray = []
    questions.forEach((question, index) => {
      let { condition_question_index, condition_choice } = question;
      if (condition_question_index == undefined || condition_question_index == -1 || (answers[condition_question_index] && answers[condition_question_index].result == condition_choice)) {
        indexArray.push(index);
      }
    });
    this.setState({ indexArray });
  }
  onSelect(index) {
    const questionIndex = this.state.indexArray[index];
    Actions.replace("survey_question", { questionIndex });
  }
  onDone() {
    const { saveAnswer, act, answer, survey } = this.props
    saveAnswer(act.id, survey, answer).then(res => {
      Actions.pop()
    }).catch(err => {
      Toast.show({ text: 'Error! ' + err.message, type: 'danger', buttonText: 'OK' })
    })
  }
  render() {
    const { act, survey: { questions }, answer: { answers } } = this.props
    const { indexArray } = this.state
    return (
      <Container>
        <Header>
          <Left>
            <Button transparent onPress={() => Actions.pop()}>
              <Icon name="arrow-back" />
            </Button>
          </Left>
          <Body style={{ flex: 2 }}>
            <Title>{act.title}</Title>
          </Body>
          <Right />
        </Header>
        <Content style={baseTheme.content}>
          <H1 style={{ textAlign: 'center' }}>Responses</H1>
          <View style={baseTheme.paddingView}>
            <List>
            {
              answers && 
              indexArray.map(
                (idx, key) => this._renderRow(key, questions[idx], answers[idx] && answers[idx].result)
                )
            }
            </List>
            <Button block full style={styles.doneButton} onPress={() => this.onDone()}><Text>Done</Text></Button>
          </View>
        </Content>
      </Container>
    );
  }

  _renderRow = (idx, question, answer) => {
    let style = baseTheme.enabledColor;
    let rowItem;
    if (answer == undefined) {
      style = baseTheme.disabledColor;
      rowItem = (<Text></Text>);
    } else {
      switch (question.type) {
        case 'bool':
          rowItem = (<Text>{answer ? "True" : "False"}</Text>);
          break;
        case 'single_sel':
          rowItem = (<Text numberOfLines={1}>{question.rows[answer].text}</Text>);
          break;
        case 'multi_sel':
          rowItem = (<Text numberOfLines={1}>{(answer.map((item, idx) => question.rows[item].text)).join(", ")}</Text>);
          break;
        case 'image_sel':
          rowItem = (<Thumbnail square source={{ uri: question.images[answer].image_url }} />);
          break;
        case 'drawing':
          rowItem = (<Text></Text>);
          break;
        case 'audio':
          rowItem = (<Text></Text>);
          break;
        default:
          rowItem = (<Text numberOfLines={1}>{answer}</Text>);
          break;
      }
    }

    return (
      <Item key={idx} style={styles.item} onPress={() => { this.onSelect(idx) }}>
        <Left>
          <Text style={style}>{question.title}</Text>
        </Left>
        <Right>
          {rowItem}
        </Right>
      </Item>
    );
  }
}

export default connect(state => ({
  act: state.core.act,
  survey: state.core.act.act_data,
  answer: state.core.answer || {}
}),
  (dispatch) => bindActionCreators({ saveAnswer }, dispatch)
)(SurveyBasicSummaryScreen);
