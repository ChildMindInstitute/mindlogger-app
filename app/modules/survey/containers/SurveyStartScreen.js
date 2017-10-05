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

  onStartSurvey() {
    Actions.survey_question({ questionIndex:0})
  }

  onStartSummary() {
    Actions.survey_summary()
  }

  render() {
    

    return (
      <Container>
      <View style={baseTheme.view}>
        <View style={{height:200}}>
          <Text style={{flex:1}}>We have questions to start</Text>
          <View style={baseTheme.centerRow}>
            <Button onPress={this.onStartSurvey}><Text>Start</Text></Button>
          </View>
          <View style={baseTheme.centerRow}>
          <Button onPress={this.onStartSummary}><Text>Summary</Text></Button>
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
