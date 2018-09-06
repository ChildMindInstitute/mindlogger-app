
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Button, Item, Label, Input, Icon, Form, Text, Switch, View, Body, Right } from 'native-base';
import { reduxForm, Field } from 'redux-form';
import { Actions } from 'react-native-router-flux';

import {FormInputItem, FormSwitchItem, FormInputAudio, FormPickerGroup, required} from '../../../../components/form/FormItem'

const validate = values => {
    const error= {};
    error.instruction= '';
    error.name= '';
    var ins = values.instruction;
    var nm = values.name;
    if(values.instruction === undefined){
        ins = '';
    }
    if(values.name === undefined){
        nm = '';
    }
    if(ins.length === 0){
        error.instruction= 'empty';
    }
    if(nm.length === 0) {
        error.name = 'empty';
    }
  return error;
};

class SurveyAddForm extends Component {

    constructor(props) {
        super(props)
    }

    componentWillMount() {
        this.setState({...this.props.initialValues})
        
    }
    
    render() {
        const { handleSubmit, onSubmit, submitting, initialValues, act } = this.props;
        let accordion = this.state && this.state.accordion
        console.log(accordion)
        return (
            <Form>
            <Field name="title" type="text" label="Title" validate={required} component={FormInputItem} />
            <Field name="instruction" type="text" label="Instruction" placeholder='' component={FormInputItem} />
            <Field name="audio_path" type="text" stackedLabel label="Audio instruction" component={FormInputAudio} />
            <Field name="accordion" type="text" label="Accordion style survey?" component={FormSwitchItem} />
            <Field name="frequency"
            label="Frequency"
            component ={FormPickerGroup}
            placeholder = "Frequency"
            options   ={[
                {text:"3x/day",value:"8h"},
                {text:"2x/day",value:"12h"},
                {text:"daily",value:"1d"},
                {text:"weekly",value:"1w"},
                {text:"monthly",value:"1m"},
                {text:"one time",value:"1"},
            ]} />
            <Button onPress={handleSubmit(onSubmit)} disabled={submitting} block style={{ margin: 15, marginTop: 50 }}>
                <Text>{ act && act.id ? "Update" : "Create" }</Text>
            </Button>
            </Form>)
    }
}

export default reduxForm({
    form: 'survey-add'
  })(SurveyAddForm)