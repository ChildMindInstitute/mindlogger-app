import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import { Content, List, ListItem, Text, Button, Right, Body, Item, Input, Row, Col, Radio, CheckBox, H2 } from 'native-base';
import { connect } from 'react-redux';
import baseTheme from '../../../theme'
import SurveyInputComponent from './SurveyInputComponent'

const headerStyle={flex:1, justifyContent:'center'}
const cellStyle={flex:1, padding: 4}
const rowStyle = {flexDirection: 'row'}

class SurveyTableInput extends SurveyInputComponent {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        let {answer, question} = this.props.data
        const {rows, cols, type} = question
        answer = answer || []
        if(answer.length<rows.length) {
            switch(type) {
                case 'text':
                    answer = rows.map((row)=>cols.map( (col) => '' ))
                    break;
                case 'single_sel':
                    answer = rows.map((row) => undefined)
                    break;
                case 'multi_sel':
                answer = rows.map((row)=>cols.map( (col) => false ))
                    break;
            }
        }
        this.setState({answer})
    }

    onTextInput(value, rowIdx, colIdx) {
        const {answer} = this.state
        answer[rowIdx][colIdx] = value
        this.setState({answer})
    }

    onChoiceSelect(rowIdx, colIdx) {
        const {answer} = this.state
        answer[rowIdx] = colIdx
        this.setState({answer})
    }

    onMultiSelect(rowIdx, colIdx) {
        const {answer} = this.state
        answer[rowIdx][colIdx] = !answer[rowIdx][colIdx]
        this.setState({answer})
    }

    renderCell(type, rowIdx, colIdx) {
      const {answer} = this.state
      console.log(type)
      switch(type) {
            case 'text':
                return (<View key={colIdx} style={cellStyle}><Input placeholder='Text' onChangeText={(value)=>this.onTextInput(value, rowIdx, colIdx)} value={answer[rowIdx][colIdx]}/></View>)
            case 'single_sel':
                return (<View key={colIdx} style={cellStyle}><CheckBox checked={answer[rowIdx] == colIdx} onPress={() => this.onChoiceSelect(rowIdx, colIdx) }/></View>)
            case 'multi_sel':
                return (<View key={colIdx} style={cellStyle}><CheckBox checked={answer[rowIdx][colIdx]} onPress={() => this.onMultiSelect(rowIdx, colIdx) } /></View>)
      }
    }
    render() {
        const { answer, question} = this.props.data
        console.log(question)
        return (
            <View>
                {this.props.disableHeader ? false : <View style={rowStyle}><H2>{question.title}</H2></View> }
                <View style={rowStyle}>
                    <Text style={headerStyle}></Text>
                    {question.cols.map((col, idx) => <Text key={idx} style={cellStyle}>{col.text}</Text> )}
                </View>
                {question.rows.map((row, rowIdx) => (
                    <View style={rowStyle} key={rowIdx}>
                        <View style={headerStyle}><Text>{row.text}</Text></View>
                        {question.cols.map( (col, colIdx) => this.renderCell(question.type, rowIdx, colIdx) )}
                    </View>)
                )}
                <View style={rowStyle} style={baseTheme.paddingView}>
                <Button full block onPress={() => this.selectAnswer(this.state.answer)}><Text>Submit</Text></Button>
                </View>
            </View>
        )
    }
}

export default connect(state => ({
    
  }),
  (dispatch) => ({
  })
)(SurveyTableInput);
