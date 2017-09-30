import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import { Content, List, ListItem, Text, Button, Right, Body, Radio } from 'native-base';
import { connect } from 'react-redux';
import baseTheme from '../../../themes/baseTheme'
import SurveyInputComponent from './SurveyInputComponent'

class SurveySingleSelector extends SurveyInputComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const { answer, question} = this.props
    const { text, rows } =question
    const { onSelect } = this.props
    console.log(this.state)

    return (
      <View style={{alignItems:'stretch'}}>
        <Text style={baseTheme.paddingView}>{text}</Text>
        <List>
        {
          rows.map((row, idx) => {
            return (
              <ListItem onPress={() => {
                console.log("press", row)
                this.selectAnswer(row.value)
              }} key={idx}>
              <Body>
              <Text>{row.text}</Text>
              </Body>
              <Right>
                <Radio selected={row.value === this.state.answer} />
              </Right>
            </ListItem>
              )
          })
        }
        </List>
      </View>
    )
  }
}

export default connect(state => ({
  }),
  (dispatch) => ({
    //actions: bindActionCreators(counterActions, dispatch)
  })
)(SurveySingleSelector);
