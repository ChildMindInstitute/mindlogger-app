
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import {reduxForm, Field, formValueSelector, FieldArray, submit, reset} from 'redux-form';
import { Container, Header, Title, Content, Button, Item, Label, Input, Body, Left, Right, Icon, Form, Text, Segment, Radio, View, Row, Subtitle, ListItem, Thumbnail } from 'native-base';

import {updateSurvey} from '../../actions'
import {FormInputItem, FormInputNumberItem, FormSwitchItem, FormPickerGroup, required} from '../../../../components/form/FormItem'
import ImageBrowser from '../../../../components/image/ImageBrowser'
import {fbAddActivity, fbUpdateActivity} from '../../../../firebase'

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
    componentWillMount() {
        this.setState({})
    }
    renderRows = ({fields, label, count, meta: {error, submitFailed}}) => {
        return (<View padder>
            {fields.map((member,index) => (
                <Field key={index} inlineLabel label={`${label} ${index+1}`} name={`${member}.text`} type="text" component={FormInputItem}/>
            ))}
            </View>)
    }

    renderImageComponent = ({input}) => {
        return (<Button transparent onPress={() => this.showImageBrowser(input) }>{input.value ? <Thumbnail square source={{uri: input.value}} /> : <Icon name="image" />}</Button>)
    }

    renderImageRows = ({fields,label, count, meta: {error, submitFailed}}) => {
        return (<View padder>
            {fields.map((item,index) => (
                <ListItem key={index} noBorder>
                    <Body>
                        <Field key={index} inlineLabel label={`${label} ${index+1}`} name={`${item}.text`} type="text" component={FormInputItem}/>
                    </Body>
                    <Right>
                        <Field name={`${item}.image_url`} type="text" component={this.renderImageComponent} />
                    </Right>
                </ListItem>
            ))}
          </View>)
    }

    showImageBrowser(input) {
        this.imageInput = input
        this.setState({imageSelect:true})
    }

    onSelectImage = (item, imagePath) => {
        if(item) {
             this.imageInput.onChange(item.image_url)
        }
        this.setState({imagePath, imageSelect:false})
        
    }

    render() {
        const { handleSubmit, onSubmit, submitting, reset, initialValues } = this.props;
        let data = {...questionInitialState}
        let {rows, cols, type} = this.props
        rows = rows || data.rows
        cols = cols || data.cols
        let question_type = this.props.question_type || (initialValues && initialValues.type)
        return (
            <Form>
            <Field name="title" type="text" placeholder="Add a question" validate={required} component={FormInputItem} />
            <Field name="rows_count" label="Number of rows" min={1} component={FormInputNumberItem} />
            <Field name="cols_count" label="Number of cols" min={1} component={FormInputNumberItem} />
            <FieldArray name="rows" label="Row" count={this.props.rows_count} component={this.renderRows} value={rows}/>
            <Field name="type"
            label="For Columns"
            component ={FormPickerGroup}
            placeholder = "Question Type"
            options   ={[
                {text:"Not selected", value:undefined},
                {text:"Text value",value:"text"},
                {text:"Number #",value:"number"},
                {text:"Single selection",value:"single_sel"},
                {text:"Multiple selection",value:"multi_sel"},
                {text:"Image selection", value: "image_sel"},
            ]} validate={required}/>
            <FieldArray name="cols" label="Col" count={this.props.cols_count} component={ type == 'image_sel' ? this.renderImageRows : this.renderRows} value={cols}/>
            { this.state.imageSelect && <ImageBrowser path={this.state.imagePath} onSelectImage={this.onSelectImage}/> }
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
    let {rows_count, cols_count, rows, cols, type} = selector(state, 'rows_count', 'cols_count', 'rows', 'cols', 'type')
    rows = rows || []
    expandFields(rows, rows_count)
    cols = cols || []
    expandFields(cols, cols_count)
    return {rows_count, cols_count, rows, cols, type}
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
            <Button block style={{ marginLeft: 15, marginRight: 15, marginBottom:15 }} onPress={()=> this.updateAndDone()}><Text>Done</Text></Button>
            
            
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
  themeState: state.drawer.themeState,
  user: state.core.user,
});

export default connect(mapStateToProps, mapDispatchToProps)(SurveyTableEditQuestionScreen);
