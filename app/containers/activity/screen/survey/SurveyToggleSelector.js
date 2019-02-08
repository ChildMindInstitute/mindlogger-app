import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import { Content, List, ListItem, Text, Button, Right, Body, CheckBox } from 'native-base';
import { Col, Row, Grid } from 'react-native-easy-grid';
import { connect } from 'react-redux';

import baseTheme from '../../../themes/baseTheme'

import SurveyInputComponent from './SurveyInputComponent'

class SurveyToggleSelector extends SurveyInputComponent {
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

    this.setState({answer})
  }

  render() {
    const { question} = this.props.data
    const { text, rows } =question
    const {answer} = this.state
    let colNum = 2
    let contentArray = []
    for (var i = 0; i < rows.length/colNum+1; i++) {
      cols = rows.slice(i*colNum, i*colNum+colNum)
      rowContent = (
        <Row key={i}>{cols.map((row,idx) => 
          (<Col size={1} key={idx}>
            <View >
              <Text numberOfLines={5}>{row.text}</Text>
              <CheckBox onPress={() => this.checkValue(row.value)} checked={answer.includes(row.value)} />
            </View>
          </Col>)
        )}
        </Row>
      )
      contentArray.push(rowContent)
    }

    return (
      <View style={{alignItems:'stretch'}}>
        { !this.props.disableHeader && (<Text style={baseTheme.paddingView}>{text}</Text>) }
        <Grid>
          {contentArray}
        </Grid>
        <View style={baseTheme.centerCol}>
        <View style={baseTheme.paddingView}>
          <Button onPress={() => this.selectAnswer(answer)}><Text>Submit</Text></Button>
        </View>
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
)(SurveyToggleSelector);
