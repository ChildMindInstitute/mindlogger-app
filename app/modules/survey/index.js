'use strict';

import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import SurveySelector from './components/surveySelector';
//import * as counterActions from '../actions';
import { Container,List,ListItem, Right, Radio,  Header, Content, Footer, Text } from 'native-base';
import { connect } from 'react-redux';

// @connect(state => ({
//   state: state.counter
// }))
class SurveyApp extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { state, actions } = this.props;
    let rows = ["row1","row2"];
    return (
      <Container style={{backgroundColor: '#fff'}}>
        <Content>
          <ListItem>
            <Text>Daily Stand Up</Text>
            <Right>
              <Radio selected={false} />
            </Right>
          </ListItem>
          <ListItem>
            <Text>Discussion with Client</Text>
            <Right>
              <Radio selected={true} />
            </Right>
          </ListItem>
        </Content>
        <Footer />
      </Container>
      
    );
  }
}

export default connect(state => ({
    state: state.counter
  }),
  (dispatch) => ({
    //actions: bindActionCreators(counterActions, dispatch)
  })
)(SurveyApp);
