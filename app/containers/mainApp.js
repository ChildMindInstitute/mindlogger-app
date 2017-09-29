'use strict';

import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import { Container, Content, View, Button, Text } from 'native-base'
import baseTheme from '../themes/baseTheme'
// @connect(state => ({
//   state: state.counter
// }))
class MainApp extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {

  }

  render() {
    const { state, actions } = this.props;
    return (
      <Container >
        <View style={baseTheme.view}>
          <View>
          <Button onPress={() => Actions.survey({ data: 'Custom data', title: 'Survey' })}><Text>Survey</Text></Button>
          </View>
        </View>
      </Container>
    );
  }
}

export default connect(state => ({
    //state: state.counter
  }),
  (dispatch) => ({
    //actions: bindActionCreators(counterActions, dispatch)

  })
)(MainApp);
