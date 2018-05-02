
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Toast, Container, Header, Title, Content, Button, Item, Label, Input, Body, Left, Right, Icon, Form, Text, Segment } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { RNS3 } from 'react-native-aws3';

import SurveyAddForm from '../../components/form/SurveyAddForm';
import { addAct, updateAct } from '../../../../actions/api';
import config from '../../../../config';
import { prepareAct } from '../../../../helper';

const surveyInitial = {
  questions:[],
  answers:[],
  frequency: '1d',
}

class SurveyAddScreen extends Component {

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
    let {acts, actIndex, user, updateAct} = this.props
    let survey = {...this.state.survey, ...body}
    let act = acts[actIndex]
    let {title, ...data} = survey
    if(user.role == 'admin') {
      return prepareAct(data).then( act_data => {
        let params = { act_data, type:'survey', title}
        return updateAct(actIndex, {id: act.id, title, act_data}).then(result => {
          Actions.pop()
        })
      }).catch(err => {
        console.log(err)
        Toast.show({text: 'Error! '+err.message, type: 'danger', buttonText: 'OK' })
      })
    } else {
      Actions.pop()
    }
  }

  onAddSurvey = ({title, ...body}) => {
    const {addSurvey, addAct, mode} = this.props
    let data = {...body, questions: [], mode}
    return prepareAct(data).then( act_data => {
      let params = { act_data, type:'survey', title}
      return addAct(params)
    }).then( res => {
      Actions.push(`survey_${mode}_edit_question`,{actIndex:0, questionIdx:0})
    }).catch(err => {
      console.log(err)
      Toast.show({text: 'Error! '+err.message, type: 'danger', buttonText: 'OK' })
    })
    
  }

  componentWillMount() {
    let {acts, actIndex} = this.props
    if(actIndex !== undefined) {
      const survey = acts[actIndex]
      this.setState({survey: {title: survey.title, ...survey.act_data}})
    } else {
      this.setState({})
    }
  }

  render() {
    const {survey} = this.state;
    const {actIndex, acts, mode} = this.props
    let title = survey ? survey.title : (mode == 'table' ? "New Table Survey" : "New Survey" )
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
          {actIndex!=undefined ? (<SurveyAddForm onSubmit={this.onEditSurvey} initialValues={survey} act={acts[actIndex]}/>) : (<SurveyAddForm onSubmit={this.onAddSurvey} initialValues={surveyInitial}/>) }
        </Content>
      </Container>
    );
  }
}
const mapDispatchToProps = {
  addAct, updateAct
}

const mapStateToProps = state => ({
  acts: state.core.acts,
  themeState: state.drawer.themeState,
  user: state.core.auth,
});

export default connect(mapStateToProps, mapDispatchToProps)(SurveyAddScreen);