import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import { Content, List, ListItem, Text, Button, Right, Body, CheckBox } from 'native-base';
import { connect } from 'react-redux';

import baseTheme from '../../../themes/baseTheme' 

import SurveyInputComponent from './SurveyInputComponent'

class SurveyMultiSelector extends SurveyInputComponent {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.setState({answer: this.props.data.answer || []})
  }

  checkValue = (value) => {
    let answer = this.state.answer
    const index = answer.indexOf(value)
    if(index<0) {
      answer.push(value)
    } else {
      answer.splice(index, 1)
    }
    this.selectAnswer(answer)
  }

  render() {
    const { question} = this.props.data
    const { title, rows } =question
    const {answer} = this.state

    return (
      <View style={{alignItems:'stretch'}}>
        { !this.props.disableHeader && (<Text style={baseTheme.paddingView}>{title}</Text>) }
        <View>
        {
          rows.map((row, idx) => {
            return (
              <ListItem key={idx} onPress={() => this.checkValue(row.value)}>
                <Body><Text>{row.text}</Text></Body>
                <Right>
                  <CheckBox onPress={() => this.checkValue(row.value)} checked={answer.includes(row.value)} />
                </Right>
              </ListItem>
              )
          })
        }
        </View>
      </View>
    )
  }
}

export default connect(state => ({
    answers: state.survey && state.survey.answers
  }),
  (dispatch) => ({
    //actions: bindActionCreators(counterActions, dispatch)
  })
)(SurveyMultiSelector);
