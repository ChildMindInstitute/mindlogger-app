import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import { Content, List, ListItem, Text, Button, Right, Body, Item, Input } from 'native-base';
import { connect } from 'react-redux';
import baseTheme from '../../../theme'
import SurveyInputComponent from './SurveyInputComponent'

class SurveyTextInput extends SurveyInputComponent {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const { answer, question} = this.props.data
    this.setState({text: answer || ""})
  }
  onChange = ( text) => {
    this.setState({text})
    this.selectAnswer(text)
  }
  onInputText = () => {
    this.selectAnswer(this.state.text || "")
  }
  render() {
    const { answer, question} = this.props.data
    return (
      <View style={baseTheme.centerCol}>
        { !this.props.disableHeader && (<Text style={baseTheme.paddingView}>{question.title}</Text>) }
        <Item rounded>
          <Input placeholder=''
            onChangeText={this.onChange}
            value={this.state.text}
            onEndEditing={this.onInputText}
            onBlur={this.onInputText}
            />
        </Item>
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
