
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Header, Title, Content, Button, Item, Label, Input, Body, Left, Right, Icon, Form, Text, Segment } from 'native-base';

import { Actions } from 'react-native-router-flux';
import SurveyAddForm from '../../components/form/SurveyAddForm';
import {addSurvey} from '../../actions'


class SurveyBasicAddScreen extends Component {

  static propTypes = {
    popRoute: React.PropTypes.func,
    navigation: React.PropTypes.shape({
      key: React.PropTypes.string,
    }),
  }

  constructor(props) {
    super(props);
    this.state = {
      mode: 1,
    };
  }

  pushRoute(route) {
    Actions.push(route)
  }

  popRoute() {
    Actions.pop()
  }

  onAddSurvey = (body) => {
    return this.props.addSurvey(body)
  }

  render() {
    return (
      <Container>
        <Header hasTabs>
          <Left>
            <Button transparent onPress={() => Actions.pop()}>
              <Icon name="arrow-back" />
            </Button>
          </Left>
          <Body>
            <Title>New Survey</Title>
          </Body>
          <Right />
        </Header>
        <Content>
          <SurveyAddForm onSubmit={this.onAddSurvey}/>
        </Content>
      </Container>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  addSurvey: body => {
    body.questions = []
    body.answers = {}
    dispatch(addSurvey(body))
    Actions.replace("survey_basic_edit_question",{surveyIdx:-1, questionIdx:0})
  },
})

const mapStateToProps = state => ({
  navigation: state.cardNavigation,
  themeState: state.drawer.themeState,
});

export default connect(mapStateToProps, mapDispatchToProps)(SurveyBasicAddScreen);
