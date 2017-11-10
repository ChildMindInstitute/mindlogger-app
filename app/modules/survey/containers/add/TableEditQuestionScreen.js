
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import {reduxForm, Field, formValueSelector, FieldArray, submit, reset} from 'redux-form';
import { Container, Header, Title, Content, Button, Item, Label, Input, Body, Left, Right, Icon, Form, Text, Segment, Radio, View, Row, Subtitle } from 'native-base';

import {updateSurvey} from '../../actions'
import {FormInputItem, FormInputNumberItem, FormSwitchItem, FormPickerGroup} from '../../../../components/form/FormItem'
import {fbAddActivity, fbUpdateActivity} from '../../../../helper'

const questionInitialState = {
  title: "",
  rows_count: 1,
  cols_count: 1,
  rows: [{text:''}],
  cols: [{text:''}],
}
class SurveyTableEditQuestionForm extends Component {

    constructor(props) {
      super(props)
    }

    renderRows = ({fields, label, count, meta: {error, submitFailed}}) => {

        return (<View padder>
            {fields.map((member,index) => (
                <Field key={index} inlineLabel label={`${label} ${index+1}`} name={`${member}.text`} type="text" component={FormInputItem}/>
            ))}
            </View>)
    }

    render() {
      const { handleSubmit, onSubmit, submitting, reset, initialValues } = this.props;
      let data = {...questionInitialState}
      let rows = this.props.rows || data.rows
      let cols = this.props.cols || data.cols
      console.log(rows, cols)
      let question_type = this.props.question_type || (initialValues && initialValues.type)
      return (
            <Form>
            <Field name="title" type="text" placeholder="Add a question" component={FormInputItem} />
            <Field name="rows_count" label="Number of rows" min={1} component={FormInputNumberItem} />
            <Field name="cols_count" label="Number of cols" min={1} component={FormInputNumberItem} />
            <FieldArray name="rows" label="Row" count={this.props.rows_count} component={this.renderRows} value={rows}/>
            <Field name="type"
            label="For Columns"
            component ={FormPickerGroup}
            placeholder = "Question Type"
            options   ={[
                {text:"Text value",value:"text"},
                {text:"Number #",value:"number"},
                {text:"Single selection",value:"single_sel"},
                {text:"Multiple selection",value:"multi_sel"},
            ]} />
            <FieldArray name="cols" label="Col" count={this.props.cols_count} component={this.renderRows} value={cols}/>

          </Form>)
    }
}

SurveyTableEditQuestionReduxForm = reduxForm({
  form: 'survey-table-edit-question',
  enableReinitialize: true,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true
})(SurveyTableEditQuestionForm)
const expandFields = (fields, count) => {
    if(fields.length>count) {
        for(var i=0;i<fields.length-count;i++)
        {
            fields.pop()
        }
    } else if(fields.length<count) {
        for(var i=0;i<count-fields.length;i++)
        {
            fields.push({})
        }
    }
}
const selector = formValueSelector('survey-table-edit-question')
SurveyTableEditQuestionValueForm = connect(
  state => {
    let {rows_count, cols_count, rows, cols} = selector(state, 'rows_count', 'cols_count', 'rows', 'cols')
    rows = rows || []
    expandFields(rows, rows_count)
    cols = cols || []
    expandFields(cols, cols_count)
    return {rows_count, cols_count, rows, cols}
  }
)(SurveyTableEditQuestionReduxForm)

class SurveyTableEditQuestionScreen extends Component {

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

    updateQuestion = (body) => {
        let {surveyIdx, questionIdx, surveys, user} = this.props
        if(surveyIdx < 0) {
        surveyIdx = surveys.length + surveyIdx
        }
        let survey = surveys[surveyIdx]
        console.log("Update:", surveyIdx, survey)
        let questions = survey.questions || []
        if(questions.length>questionIdx) {
            questions[questionIdx] = body
        } else {
            questions.push(body)
        }
        survey.questions = questions
        this.props.updateSurvey(surveyIdx, survey)
        if(this.isNext) {
            Actions.replace("survey_table_edit_question",{surveyIdx, questionIdx:(questionIdx + 1)})
        } else {
            if(user.role == 'clinician') {
                fbUpdateActivity('surveys', survey).then(result => {
                    Actions.pop()
                })
            } else {
                Actions.pop()
            }
        }
        
    }

    updateAndNext() {
        this.isNext=true
        this.props.submitForm()
    }
    updateAndDone() {
        this.isNext=false
        this.props.submitForm()
    }
    deleteQuestion() {
        let {surveyIdx, questionIdx, surveys} = this.props
        if(surveyIdx < 0) {
        surveyIdx = surveys.length + surveyIdx
        }
        let survey = surveys[surveyIdx]
        let questions = survey.questions || []
        if(questions.length>questionIdx) {
        questions.splice(questionIdx,1)
        this.props.updateSurvey(surveyIdx, survey)
        } else {
        }
        survey.questions = questions
        questionIdx = questionIdx - 1
        Actions.replace("survey_table_edit_question",{surveyIdx, questionIdx})
    }

    componentWillMount() {
        let {surveyIdx, questionIdx, surveys} = this.props
        if(surveyIdx < 0) {
        surveyIdx = surveys.length + surveyIdx
        }
        const survey = surveys[surveyIdx]
        let question = questionInitialState
        if(questionIdx<survey.questions.length) {
            question = survey.questions[questionIdx]
        } else if(questionIdx>0) {
            question = { ...survey.questions[questionIdx-1], title: ''}
        }
        this.setState({survey, question, questionIdx})
    }

    render() {
        
        const {survey, question, questionIdx} = this.state || {}
        return (
        <Container>
            <Header>
                <Left>
                    <Button transparent onPress={() => Actions.pop()}>
                    <Icon name="arrow-back" />
                    </Button>
                </Left>
                <Body style={{flex:2}}>
                    <Title>{survey.title}</Title>
                    <Subtitle>Table {survey.accordion ? "accordion" : "sequential"} survey</Subtitle>
                </Body>
                <Right>
                </Right>
            </Header>
            <Content padder>
            <Text>Question {questionIdx+1}</Text>
            <SurveyTableEditQuestionValueForm onSubmit={this.updateQuestion} initialValues={question}/>
            <Row style={{ marginTop: 20 }}>
                <Button block onPress={() => this.updateAndNext()} style={{ margin: 15, flex:1}}>
                <Text>Next</Text>
                </Button>
                <Button block danger onPress={() => this.deleteQuestion()} style={{ margin: 15, flex:1}}>
                <Text>Delete</Text>
                </Button>
            </Row>
            <Button block style={{ marginLeft: 15, marginRight: 15 }} onPress={()=> this.updateAndDone()}><Text>Done</Text></Button>
            
            
            </Content>
        </Container>
        );
    }
} 

const mapDispatchToProps = (dispatch) => ({
  updateSurvey: (index, data) => dispatch(updateSurvey(index, data)),
  submitForm: () => {
    return dispatch(submit('survey-table-edit-question'))
  },
  resetForm: () => {
    return dispatch(reset('survey-table-edit-question'))
  },
})

const mapStateToProps = state => ({
  surveys: state.survey.surveys,
  navigation: state.cardNavigation,
  themeState: state.drawer.themeState,
  user: state.core.user,
});

export default connect(mapStateToProps, mapDispatchToProps)(SurveyTableEditQuestionScreen);
