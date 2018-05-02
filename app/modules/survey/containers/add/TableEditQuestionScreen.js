
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions } from 'react-native-router-flux';
import {reduxForm, Field, formValueSelector, FieldArray, submit, reset} from 'redux-form';
import { Toast, Container, Header, Title, Content, Button, Item, Label, Input, Body, Left, Right, Icon, Form, Text, Segment, Radio, View, Row, Subtitle, ListItem, Thumbnail } from 'native-base';

import {FormInputItem, FormInputNumberItem, FormSwitchItem, FormPickerGroup, required} from '../../../../components/form/FormItem'
import ImageBrowser from '../../../../components/image/ImageBrowser'
import { updateActivity } from '../../../../actions/coreActions';
import { updateAct } from '../../../../actions/api';

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
            placeholder = "Response type"
            options   ={[
                {text:"Response Type", value:undefined},
                {text:"Text value",value:"text"},
                {text:"Number #",value:"number"},
                {text:"Single selection",value:"single_sel"},
                {text:"Multiple selection",value:"multi_sel"},
                {text:"Image selection", value: "image_sel"},
            ]} validate={required}/>
            <FieldArray name="cols" label="Col" count={this.props.cols_count} component={ type == 'image_sel' ? this.renderImageRows : this.renderRows} value={cols}/>
            { this.state.imageSelect && <ImageBrowser path={this.state.imagePath} onFile={this.onSelectImage}/> }
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
    return fields
}
const selector = formValueSelector('survey-table-edit-question')
SurveyTableEditQuestionValueForm = connect(
  state => {
    let {rows_count, cols_count, rows, cols, type} = selector(state, 'rows_count', 'cols_count', 'rows', 'cols', 'type')
    rows = rows || []
    rows = expandFields(rows, rows_count)
    cols = cols || []
    cols = expandFields(cols, cols_count)
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
        let {actIndex, questionIdx, acts, user, updateActivity, updateAct, resetForm} = this.props
        if(actIndex < 0) {
            actIndex = acts.length + actIndex
        }
        const act = acts[actIndex]
        const questions = act.act_data.questions || []
        if(questions.length>questionIdx) {
            questions[questionIdx] = body
        } else {
            questions.push(body)
        }
        updateActivity(actIndex, act)
		if(this.isNext) {
            questionIdx = questionIdx + 1
            resetForm();
			Actions.replace("survey_table_edit_question",{actIndex, questionIdx})
		} else {
            if(user.role == 'admin') {
                updateAct(actIndex, act).then(res => {
                    Actions.pop()
                }).catch(err => {
                    Toast.show({text: 'Error! '+err.message, type: 'danger', buttonText: 'OK' })
                    console.log(err)
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
        let {actIndex, questionIdx, acts, updateActivity} = this.props
        const act = acts[actIndex]
        if(actIndex < 0) {
        	actIndex = acts.length + actIndex
        }
        const survey = act.act_data
        let questions = survey.questions || []
        if(questions.length>questionIdx) {
            questions.splice(questionIdx,1)
			updateActivity(actIndex, act)
        }
        survey.questions = questions
        questionIdx = questionIdx - 1
        if(questionIdx<0) questionIdx = 0
        Actions.replace("survey_table_edit_question",{actIndex, questionIdx})
    }

    componentWillMount() {
        let {actIndex, questionIdx, acts} = this.props
        if(actIndex < 0) {
            actIndex = acts.length + actIndex
        }
        const act = acts[actIndex]
        const survey = act.act_data
        let question = questionInitialState
        survey.questions = survey.questions || []
        if(questionIdx<survey.questions.length) {
            question = survey.questions[questionIdx]
        } else if(questionIdx>0) {
            question = {...questionInitialState, ...survey.questions[questionIdx-1], title: ''}
        }
        this.setState({act, question, questionIdx})
    }

    render() {
        const {act, questionIdx, question} = this.state
        const survey = act.act_data
        return (
        <Container>
            <Header>
                <Left>
                    <Button transparent onPress={() => Actions.pop()}>
                    <Icon name="arrow-back" />
                    </Button>
                </Left>
                <Body style={{flex:2}}>
                    <Title>{act.title}</Title>
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
  submitForm: () => {
    return dispatch(submit('survey-table-edit-question'))
  },
  resetForm: () => {
    return dispatch(reset('survey-table-edit-question'))
  },
  ...bindActionCreators({updateActivity, updateAct}, dispatch)
})

const mapStateToProps = state => ({
  acts: state.core.acts,
  themeState: state.drawer.themeState,
  user: state.core.auth,
});

export default connect(mapStateToProps, mapDispatchToProps)(SurveyTableEditQuestionScreen);
