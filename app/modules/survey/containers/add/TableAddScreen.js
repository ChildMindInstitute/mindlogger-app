
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Header, Title, Content, Button, Item, Label, Input, Body, Left, Right, Icon, Form, Text, Segment } from 'native-base';

import { Actions } from 'react-native-router-flux';
import SurveyAddForm from '../../components/form/SurveyAddForm';
import {addSurvey, updateSurvey} from '../../actions'
import {fbAddActivityWithAudio, fbUpdateActivityWithAudio} from '../../../../firebase'

class SurveyTableAddScreen extends Component {

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
    const data = {...body, 'activity_type':'survey', mode: 'table'}
    const {addSurvey} = this.props
    return fbAddActivityWithAudio('surveys', data, result => {
      console.log("pushed", result)
    }).then(res => {
      return addSurvey(res)
    }).catch(err => {

    })
    
  }

  onEditSurvey = (body) => {
    let {surveys, surveyIdx, user, updateSurvey} = this.props
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
    let title = survey ? survey.title : "New Table Survey"
    return (
      <Container>
        <Header hasTabs>
          <Left>
            <Button transparent onPress={() => Actions.pop()}>
              <Icon name="arrow-back" />
            </Button>
          </Left>
          <Body style={{flex:3}}>
            <Title>{title}</Title>
          </Body>
          <Right />
        </Header>
        <Content>
          <Content padder>
            {survey ? (<SurveyAddForm onSubmit={this.onEditSurvey} initialValues={survey}/>) : (<SurveyAddForm onSubmit={this.onAddSurvey}/>) }
          </Content>
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
    Actions.replace("survey_table_edit_question",{surveyIdx:-1, questionIdx:0})
  },
  updateSurvey: (surveyIdx, body) => dispatch(updateSurvey(surveyIdx, body)),
})

const mapStateToProps = state => ({
  surveys: state.survey.surveys,
  themeState: state.drawer.themeState,
  user: state.core.user,
});

export default connect(mapStateToProps, mapDispatchToProps)(SurveyTableAddScreen);
