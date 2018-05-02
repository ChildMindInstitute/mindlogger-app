import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import { Content, List, ListItem, Text, Button, Right, Body } from 'native-base';
import { connect } from 'react-redux';
import baseTheme from '../../../themes/baseTheme'
import SurveyInputComponent from './SurveyInputComponent'

class SurveyBoolSelector extends SurveyInputComponent {
  constructor(props) {
    super(props);
  }
  render() {
    const { answer, question} = this.props.data
    const { text, rows } =question

    let texts = rows ? rows : ["YES", "NO"]
    let values = [true, false]

    return (
      <View style={baseTheme.centerCol}>
        { !this.props.disableHeader && (<Text style={baseTheme.paddingView}>{text}</Text>) }
        <View style={baseTheme.spacedRow}>
        { texts.map((text, idx) => {
          if (values[idx] === this.state.answer) {
            return (<Button success onPress={() => { this.selectAnswer(values[idx]) }} key={idx}><Text>{text}</Text></Button>)
          } else {
            return (<Button light onPress={() => {this.selectAnswer(values[idx])}} key={idx}><Text>{text}</Text></Button>)
          }
        })}
        </View>
      </View>
    )
  }
}

export default connect(state => ({
    
  }),
  (dispatch) => ({
    //actions: bindActionCreators(counterActions, dispatch)
  })
)(SurveyBoolSelector);
