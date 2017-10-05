import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import { Container, Content, Text, Button, Center } from 'native-base';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { bindActionCreators } from 'redux';

import baseTheme from '../../../themes/baseTheme'
import * as surveyActions from '../actions'

class SurveyStartScreen extends Component {
  constructor(props) {
    super(props)
    
  }

  componentWillMount() {
    this.props.actions.getQuestions()
  }

  onStartSequence() {
    Actions.survey_question({ questionIndex:0})
  }

  onStartAccordion() {
    Actions.survey_accordion()
  }

  render() {
    
    return (
      <Container>
      <View style={baseTheme.view}>
        <View style={{height:200}}>
          <Text style={{flex:1}}>We have questions to start</Text>
          <View style={baseTheme.centerRow}>
            <Button onPress={this.onStartSequence}><Text>Sequence</Text></Button>
          </View>
          <View style={baseTheme.centerRow}>
          <Button onPress={this.onStartAccordion}><Text>Accordion</Text></Button>
          </View>
        </View>
      </View>
      </Container>
    )
  }
}

export default connect(state => ({
    
  }),
  (dispatch) => ({
    actions: bindActionCreators(surveyActions, dispatch)
  })
)(SurveyStartScreen);
