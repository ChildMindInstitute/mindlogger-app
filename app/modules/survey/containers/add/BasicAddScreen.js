
import React, { Component } from 'react';
import { connect } from 'react-redux';
import SurveyAddScreen from './SurveyAddScreen'


export default class SurveyBasicAddScreen extends React.Component {
  render() {
    return (<SurveyAddScreen {...this.props} mode='basic'/>)
  }
}
