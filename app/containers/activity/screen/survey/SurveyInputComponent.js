import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import { Content, List, ListItem, Text, Button, Right, Body } from 'native-base';
import { connect } from 'react-redux';
import baseTheme from '../../../../themes/baseTheme';

export default class SurveyInputComponent extends Component {
  constructor(props) {
    super(props);
  }
  selectAnswer = (answer, isFinal = false) => {
    const {config} = this.props
    this.props.onChange(answer, isFinal)
  }
  render() {
    return (<View></View>)
  }
}