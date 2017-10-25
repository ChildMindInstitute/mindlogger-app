
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Button, Item, Label, Input, Icon, Form, Text, Switch, View, Body, Right } from 'native-base';
import { reduxForm, Field } from 'redux-form';
import { Actions } from 'react-native-router-flux';

import {FormInputItem, FormSwitchItem} from '../../../../components/form/FormItem'

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
        const { handleSubmit, onSubmit, submitting, initialValues } = this.props;
        let accordion = this.state && this.state.accordion
        console.log(accordion)
        return (
            <Form>
            <Field name="title" type="text" label="Title" stackedLabel placeholder='eg. Behaviour' component={FormInputItem} />
            <Field name="instruction" type="text" label="Instruction" stackedLabel placeholder='' component={FormInputItem} />
            <Field name="accordion" type="text" label="Sequential/Accordion" component={FormSwitchItem} />
            
            <Button onPress={handleSubmit(onSubmit)} block style={{ margin: 15, marginTop: 50 }}>
                <Text>{ initialValues ? "Update" : "Create" }</Text>
            </Button>
            </Form>)
    }
}

export default reduxForm({
    form: 'survey-add'
  })(SurveyAddForm)