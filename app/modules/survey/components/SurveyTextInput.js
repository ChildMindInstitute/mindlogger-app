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
    const { answer, question} = this.props
    this.setState({text: answer})
  }
  render() {
    const { answer, question} = this.props
    const { onSelect } = this.props
    return (
      <View style={baseTheme.centerCol}>
      <Text style={baseTheme.paddingView}>{question.text}</Text>
      <Item rounded>
        <Input placeholder='' onChangeText={(text) => this.setState({text})}
        value={this.state.text}/>
      </Item>
      <View style={baseTheme.paddingView}>
      <Button onPress={() => this.selectAnswer(this.state.text)}><Text>Submit</Text></Button>
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
)(SurveyTextInput);
