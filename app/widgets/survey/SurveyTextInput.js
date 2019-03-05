import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import { Content, List, ListItem, Text, Button, Right, Body, Item, Input } from 'native-base';
import { connect } from 'react-redux';

import baseTheme from '../../../theme';
import SurveyInputComponent from './SurveyInputComponent';

class SurveyTextInput extends SurveyInputComponent {
  constructor(props) {
    super(props);
  }

  onChange = (text) => {
    this.selectAnswer(text)
  }
  render() {
    const { answer, config} = this.props
    return (
      <View style={baseTheme.centerCol}>
        { config.display && (
          <Text style={baseTheme.paddingView}>{config.label}</Text>
          ) }
          <Input placeholder=''
            onChangeText={this.onChange}
            value={answer}
            />
      </View>
    )
  }
}

export default connect(state => ({
    
  }),
  (dispatch) => ({
    //actions: bindActionCreators(counterActions, dispatch)
  })
)(SurveyTextInput);
