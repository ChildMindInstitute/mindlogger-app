
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Button, Item, Label, Input, Icon, Form, Text, Switch, View, Body, Right } from 'native-base';
import { reduxForm, Field } from 'redux-form';
import { Actions } from 'react-native-router-flux';

import FormItem from '../../../../components/form/FormItem'

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

export class SurveyAddForm extends Component {

    constructor(props) {
        super(props)
    }

    componentWillMount() {
        this.setState({...this.props.initialValues})
    }
    
    render() {
        const { handleSubmit, onSubmit, submitting } = this.props;
        const {accordion} = this.state;
        console.log(accordion)
        return (
            <Form onSubmit={handleSubmit(onSubmit)}>
            
            <Item stackedLabel>
                <Label>Title</Label>
                <Field name="title" placeholder='eg. Behaviour' component={Input} />
            </Item>
            <Item stackedLabel>
                <Label>Instruction</Label>
                <Field component={Input} name="instruction" style={{ height: 100 }} multiline={true} placeholder='...'/>
            </Item>

            <Item style={{ height: 40}} last>
                <Label>Sequential/Accordion</Label>
                <Right>
                    <Switch style={{ margin: 20 }} name="accordion" value={accordion} onValueChange={(value) => { 
                        this.setState({ ...this.state, accordion:value})
                        console.log(value)
                    } } />
                </Right>
            </Item>
            
            <Button type="submit" block style={{ margin: 15, marginTop: 50 }}>
                <Text>Create</Text>
            </Button>
            </Form>)
    }
}

export default reduxForm({
    form: 'survey-add',
    validate
  })(SurveyAddForm)