import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import { Content, List, ListItem, Text, Button, Right, Body } from 'native-base';
import { connect } from 'react-redux';
import baseTheme from '../../../themes/baseTheme'

export default class SurveyInputComponent extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.setState({answer: this.props.answer})
  }
  selectAnswer = (answer) => {
    this.setState({ answer })
    this.props.onSelect(answer)
    console.log(this.state)
  }
  render() {
    return (<View></View>)
  }
}