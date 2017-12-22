import React, {Component} from 'react';
import {StyleSheet, TouchableOpacity, ImageBackground} from 'react-native';
import { Content, List, ListItem, Text, Button, Right, Body, Item, Input, Row, Col, Radio, CheckBox, H2, View, Grid, Thumbnail } from 'native-base';
import { connect } from 'react-redux';
import baseTheme from '../../../theme'
import SurveyInputComponent from './SurveyInputComponent'
import styles from './styles'

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

    renderCell(question, rowIdx, colIdx) {
      const {answer} = this.state

      switch(question.type) {
            case 'text':
                return (<View key={colIdx} style={styles.textViewStyle} ><Input placeholder='' onChangeText={(value)=>this.onTextInput(value, rowIdx, colIdx)} value={answer[rowIdx][colIdx]}/></View>)
            case 'number':
                return (<Button bordered style={{width:'100%'}} delayLongPress={600} onPress={() => this.onNumberAdd(1, rowIdx,colIdx)} onLongPress={() => this.onNumberAdd(-1, rowIdx, colIdx)}><Text style={styles.cellTextStyle}>{answer[rowIdx][colIdx]}</Text></Button>)
            case 'single_sel':
                return (<Button style={styles.buttonStyle} transparent onPress={() => this.onChoiceSelect(rowIdx, colIdx) }><Radio selected={answer[rowIdx] == colIdx} onPress={() => this.onChoiceSelect(rowIdx, colIdx) }/></Button>)
            case 'multi_sel':
                return (<TouchableOpacity style={styles.buttonStyle} transparent onPress={() => this.onMultiSelect(rowIdx, colIdx) }><CheckBox style={{marginLeft:-4}} checked={answer[rowIdx][colIdx]} onPress={() => this.onMultiSelect(rowIdx, colIdx) } /></TouchableOpacity>)
            case 'image_sel':
                return (<TouchableOpacity key={colIdx} onPress={() => {
                    this.onChoiceSelect(rowIdx, colIdx)
                  }}>
                  <ImageBackground style={styles.image} source={{uri: question.cols[colIdx].image_url}}/>
                  { answer[rowIdx] != colIdx && <View style={styles.imageUnselected}/> }
                  </TouchableOpacity>)
            default:
                  return (<Text></Text>)
      }
    }
    render() {
        const { answer, question} = this.props.data
        console.log(answer)
        return (
            <View>
                {this.props.disableHeader ? false : <View style={styles.rowStyle}><H2>{question.title}</H2></View> }
                <Row style={styles.rowStyle}>
                    <Col style={styles.cellStyle}><Text style={styles.cellTextStyle}>{' '}</Text></Col>
                    {question.cols.map((col, idx) => (<Col key={idx} style={styles.cellStyle}><Text style={styles.cellTextStyle}>{col.text}</Text></Col>))}
                </Row>
                {question.rows.map((row, rowIdx) => (
                    <Row style={styles.rowStyle} key={rowIdx}>
                        <Col style={styles.cellStyle}><Text>{row.text}</Text></Col>
                        {question.cols.map( (col, colIdx) => <Col key={colIdx} style={styles.cellStyle}>{this.renderCell(question, rowIdx, colIdx)}</Col> )}
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
