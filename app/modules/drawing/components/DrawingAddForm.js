
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Button, Item, Label, Input, Icon, Form, Text, Switch, View, Body, Right, Left, Thumbnail } from 'native-base';
import { reduxForm, Field } from 'redux-form';
import { Actions } from 'react-native-router-flux';

import {FormInputItem, FormInputAudio, FormPickerGroup, required} from '../../../components/form/FormItem'
import ImageBrowser from '../../../components/image/ImageBrowser'

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



class DrawingAddForm extends Component {

    constructor(props) {
        super(props)
    }

    componentWillMount() {
        this.setState({...this.props.initialValues})
        
    }

    renderImageField = ({ input, label, style, name, itemStyle, ...props, meta: {touched, error, warning} }) => {
        return (<Item onPress={() => this.showImageBrowser(input)}>
            <Left>
                <Text>Image</Text>
            </Left>
            <Body>
                {input.value ? (<Thumbnail square source={{uri: input.value}} />) : (<Thumbnail square />) }
            </Body>
            <Right>
                {input.value ? (<Button transparent onPress={() => input.onChange(undefined) }><Icon name="trash" style={{color: 'red'}}/></Button>) : (<View />) }
            </Right>
        </Item>)
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
        const { handleSubmit, onSubmit, submitting, initialValues } = this.props;
        return (
            <Form>
            <Field name="title" type="text" label="Title" stackedLabel placeholder='eg. Behaviour' validate={required} component={FormInputItem} />
            <Field name="instruction" type="text" label="Instruction" stackedLabel placeholder='' component={FormInputItem} />
            <Field name="audio_path" type="text" stackedLabel label="Audio instruction" component={FormInputAudio} />

            <Field name="image_url" type="text" stackedLabel label="Fill Image" component={this.renderImageField} />
            { this.state.imageSelect && <ImageBrowser path={this.state.imagePath} onSelectImage={this.onSelectImage}/> }
            <Field name="timer"
            label="Timer"
            component ={FormPickerGroup}
            placeholder = "Please pick time"
            options   ={[
                {text:"none", value:0},
                {text:"10s",value:10},
                {text:"30s",value:30},
                {text:"60s",value:60},
            ]} />
            <Field name="frequency"
            label="Frequency"
            component ={FormPickerGroup}
            placeholder = "Select frequency"
            options   ={[
                {text:"3x/day",value:"8h"},
                {text:"2x/day",value:"12h"},
                {text:"daily",value:"1d"},
                {text:"weekly",value:"1w"},
                {text:"monthly",value:"1m"},
                {text:"one time",value:"1"},
            ]} />
            <Button onPress={handleSubmit(onSubmit)} disabled={submitting} block style={{ margin: 15, marginTop: 50 }}>
                <Text>{ initialValues.uuid ? "Update" : "Create" }</Text>
            </Button>
            </Form>)
    }
}

export default reduxForm({
    form: 'drawing-add'
})(DrawingAddForm)