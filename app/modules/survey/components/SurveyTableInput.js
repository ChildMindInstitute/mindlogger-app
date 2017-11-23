import React, {Component} from 'react';
import {StyleSheet} from 'react-native';
import { Content, List, ListItem, Text, Button, Right, Body, Item, Input, Row, Col, Radio, CheckBox, H2, View, Grid } from 'native-base';
import { connect } from 'react-redux';
import baseTheme from '../../../theme'
import SurveyInputComponent from './SurveyInputComponent'

const headerStyle={flex:1, justifyContent:'center'}
const cellStyle={height: 50, padding: 4, alignItems: 'center', alignContent: 'center', justifyContent:'center'}
const buttonStyle={width: '100%', alignItems: 'center', justifyContent:'center', alignContent: 'center'}
const cellTextStyle={textAlign:'center', width:'100%'}
const rowStyle = {height: 50}

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
                case 'number':
                    answer = rows.map((row)=>cols.map( (col) => 0 ))
                    break;
                case 'single_sel':
                    answer = rows.map((row) => 0)
                    break;
                case 'multi_sel':
                    answer = rows.map((row)=>cols.map( (col) => false ))
                    break;
            }
        }
        this.setState({answer})
    }

    onTextInput(value, rowIdx, colIdx) {
        let {answer} = this.state
        answer[rowIdx][colIdx] = value
        this.selectAnswer(answer)
    }

    onChoiceSelect(rowIdx, colIdx) {
        let {answer} = this.state
        answer[rowIdx] = colIdx
        this.selectAnswer(answer)
    }

    onMultiSelect(rowIdx, colIdx) {
        let {answer} = this.state
        answer[rowIdx][colIdx] = !answer[rowIdx][colIdx]
        this.selectAnswer(answer)
    }

    onNumberAdd(value, rowIdx, colIdx) {
        let {answer} = this.state
        answer[rowIdx][colIdx] = (answer[rowIdx][colIdx] || 0) + value
        this.selectAnswer(answer)
    }

    renderCell(type, rowIdx, colIdx) {
      const {answer} = this.state
      console.log(type)
      switch(type) {
            case 'text':
                return (<View key={colIdx} style={{width:'100%', height: '100%', alignItems:'stretch'}} ><Input placeholder='Text' onChangeText={(value)=>this.onTextInput(value, rowIdx, colIdx)} value={answer[rowIdx][colIdx]}/></View>)
            case 'number':
                return (<Button bordered style={{width:'100%'}} delayLongPress={600} onPress={() => this.onNumberAdd(1, rowIdx,colIdx)} onLongPress={() => this.onNumberAdd(-1, rowIdx, colIdx)}><Text style={cellTextStyle}>{answer[rowIdx][colIdx]}</Text></Button>)
            case 'single_sel':
                return (<Button style={buttonStyle} transparent onPress={() => this.onChoiceSelect(rowIdx, colIdx) }><Radio selected={answer[rowIdx] == colIdx} onPress={() => this.onChoiceSelect(rowIdx, colIdx) }/></Button>)
            case 'multi_sel':
                return (<Button style={{...buttonStyle, marginLeft: -4}} transparent onPress={() => this.onMultiSelect(rowIdx, colIdx) }><CheckBox checked={answer[rowIdx][colIdx]} onPress={() => this.onMultiSelect(rowIdx, colIdx) } /></Button>)
      }
    }
    render() {
        const { answer, question} = this.props.data
        console.log(answer)
        return (
            <View>
                {this.props.disableHeader ? false : <View style={rowStyle}><H2>{question.title}</H2></View> }
                <Row style={rowStyle}>
                    <Col style={cellStyle}><Text style={cellTextStyle}>{' '}</Text></Col>
                    {question.cols.map((col, idx) => (<Col key={idx} style={cellStyle}><Text style={cellTextStyle}>{col.text}</Text></Col>))}
                </Row>
                {question.rows.map((row, rowIdx) => (
                    <Row style={rowStyle} key={rowIdx}>
                        <Col style={cellStyle}><Text>{row.text}</Text></Col>
                        {question.cols.map( (col, colIdx) => <Col key={colIdx} style={cellStyle}>{this.renderCell(question.type, rowIdx, colIdx)}</Col> )}
                    </Row>)
                )}
            </View>
        )
    }
}

export default connect(state => ({
    
  }),
  (dispatch) => ({
  })
)(SurveyTableInput);
