import React, {Component} from 'react';
import {StyleSheet, TouchableOpacity, ImageBackground, Image} from 'react-native';
import { Content, List, ListItem, Text, Button, Right, Body, Item, Input, Row, Col, Radio, CheckBox, H2, View, Grid, Thumbnail } from 'native-base';
import { connect } from 'react-redux';
import baseTheme from '../../../../theme'
import SurveyInputComponent from './SurveyInputComponent'
import styles from './styles'

class SurveyTableInput extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.updateAnswer(this.props);
    }

    componentWillReceiveProps = (nextProps) => {
        if (nextProps.answer != this.props.answer) {
            this.updateAnswer(nextProps);
        }
    }

    updateAnswer = ({answer, config}) => {
        const {rows, cols, mode} = config;
        answer = answer || [];
        if(answer.length<rows.length) {
            switch(config.mode) {
                case 'text':
                    answer = rows.map((row)=>cols.map( (col) => '' ));
                    break;
                case 'number':
                    answer = rows.map((row)=>cols.map( (col) => 0 ));
                    break;
            }
        }
        this.setState({answer});
    }

    onTextInput(value, rowIdx, colIdx) {
        let {answer} = this.state;
        answer[rowIdx][colIdx] = value;
        this.setState({answer});
        this.props.onChange(answer);
    }

    onNumberAdd(value, rowIdx, colIdx) {
        let {answer} = this.state;
        answer[rowIdx][colIdx] = (answer[rowIdx][colIdx] || 0) + value
        this.setState({answer});
        this.props.onChange(answer);
    }

    renderCell(config, rowIdx, colIdx) {
        const {answer} = this.state

        switch(config.mode) {
            case 'text':
                return (<View key={colIdx} style={styles.textViewStyle} ><Input placeholder='' onChangeText={(value)=>this.onTextInput(value, rowIdx, colIdx)} value={answer[rowIdx][colIdx]}/></View>)
            case 'number':
                return (<Button bordered style={{width:'100%'}} delayLongPress={600} onPress={() => this.onNumberAdd(1, rowIdx,colIdx)} onLongPress={() => this.onNumberAdd(-1, rowIdx, colIdx)}><Text style={styles.cellTextStyle}>{answer[rowIdx][colIdx]}</Text></Button>)
            default:
                  return (<Text></Text>)
      }
    }
    render() {
        const { answer, config} = this.props;
        let height = 60
        if(this.state.dimensions && config.mode == 'select') {
            height = this.state.dimensions.width/(config.cols.length + 1)
        }
        const cellStyle = {
            height,
            padding: 4,
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
        }
        const rowStyle = {
            height
        }
        this.imageStyle = {
            width: (height-3),
            height: (height-3),
            padding: 3,
        }
        return (
            <View onLayout={this.onLayout}>
                <Row style={styles.rowStyle}>
                    <Col style={cellStyle}><Text style={styles.cellTextStyle}>{' '}</Text></Col>
                    {config.cols.map((col, idx) => (<Col key={idx} style={styles.cellStyle}><Text style={styles.cellTextStyle}>{col}</Text></Col>))}
                </Row>
                {config.rows.map((row, rowIdx) => (
                    <Row style={rowStyle} key={rowIdx}>
                        <Col style={cellStyle}><Text>{row}</Text></Col>
                        {config.cols.map( (col, colIdx) => <Col key={colIdx} style={cellStyle}>{this.renderCell(config, rowIdx, colIdx)}</Col> )}
                    </Row>)
                )}
            </View>
        )
    }

    onLayout = event => {
        if (this.state.dimensions) return // layout was already called
        let {width, height, top, left} = event.nativeEvent.layout
        this.setState({dimensions: {width, height, top, left}})
    }
}

export default connect(state => ({
    
  }),
  (dispatch) => ({
  })
)(SurveyTableInput);
