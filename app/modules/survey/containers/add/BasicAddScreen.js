
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Header, Title, Content, Button, Item, Label, Input, Body, Left, Right, Icon, Form, Text, Segment } from 'native-base';

import { Actions } from 'react-native-router-flux';
import SurveyAddForm from '../../components/form/SurveyAddForm';
import {addSurvey, updateSurvey} from '../../actions'
import {fbAddActivity,fbAddActivityWithAudio, fbUpdateActivityWithAudio} from '../../../../firebase'

const surveyInitial = {
  questions:[],
  answers:[],
  frequency: '1d',
}

class SurveyBasicAddScreen extends Component {

  constructor(props) {
    super(props);
  }

  pushRoute(route) {
    Actions.push(route)
  }

  popRoute() {
    Actions.pop()
  }

  onEditSurvey = (body) => {
    let {surveyIdx, user, updateSurvey} = this.props
    let survey = {...this.state.survey, ...body}
    if(user.role == 'clinician') {
      return fbUpdateActivityWithAudio('surveys', survey).then(result => {
        updateSurvey(surveyIdx, survey)
        Actions.pop()
      }).catch(err => {
        console.log(err, survey)
      })
    } else {
      updateSurvey(surveyIdx, survey)
      Actions.pop()
    }
  }

  onAddSurvey = (body) => {
    const {addSurvey} = this.props
    let data = {...body, questions: [], 'activity_type':'survey', mode: 'basic'}
    return fbAddActivityWithAudio('surveys', data, result => {
      console.log("pushed", result)
    }).then(res => {
      return addSurvey(res)
    })
  }

  componentWillMount() {
    let {surveys, surveyIdx} = this.props
    if(surveyIdx) {
      const survey = surveys[surveyIdx]
      this.setState({survey})
    } else {
      this.setState({})
    }
  }

  render() {
    const {survey} = this.state;
    let title = survey ? survey.title : "New Survey"
    return (
      <Container>
        <Header hasTabs>
          <Left>
            <Button transparent onPress={() => Actions.pop()}>
              <Icon name="arrow-back" />
            </Button>
          </Left>
          <Body>
            <Title>{title}</Title>
          </Body>
          <Right />
        </Header>
        <Content padder>
          {survey ? (<SurveyAddForm onSubmit={this.onEditSurvey} initialValues={survey}/>) : (<SurveyAddForm onSubmit={this.onAddSurvey} initialValues={surveyInitial}/>) }
        </Content>
      </Container>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  addSurvey: body => {
    dispatch(addSurvey(body))
    Actions.replace("survey_basic_edit_question",{surveyIdx:-1, questionIdx:0})
  },
  updateSurvey: (surveyIdx, body) => dispatch(updateSurvey(surveyIdx, body))
})

const mapStateToProps = state => ({
  surveys: state.survey.surveys,
  themeState: state.drawer.themeState,
  user: state.core.user,
});

export default connect(mapStateToProps, mapDispatchToProps)(SurveyBasicAddScreen);
