
import React, { Component } from 'react';
import { connect } from 'react-redux';
import SurveyAddScreen from './SurveyAddScreen'


export default class TableAddScreen extends React.Component {
  render() {
    return (<SurveyAddScreen {...this.props} mode='table'/>)
  }
}
