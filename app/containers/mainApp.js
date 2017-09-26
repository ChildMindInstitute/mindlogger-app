'use strict';

import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import { Container, Content, View, Button, Text } from 'native-base'
// @connect(state => ({
//   state: state.counter
// }))
class MainApp extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { state, actions } = this.props;
    return (
      <Container style={{flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Content >
        <Button onPress={() => Actions.survey({ data: 'Custom data', title: 'Survey' })}><Text>Survey</Text></Button>
        </Content>
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
