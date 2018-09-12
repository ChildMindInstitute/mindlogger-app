import React, {Component} from 'react';
import {StyleSheet, TouchableOpacity, ImageBackground, Image} from 'react-native';
import { Content, List, ListItem, Text, Button, Right, Body, Item, Input, Row, Col, Radio, CheckBox, H2, View, Grid, Thumbnail } from 'native-base';
import { connect } from 'react-redux';
import baseTheme from '../../../../theme'
import SurveyInputComponent from './SurveyInputComponent'
import styles from './styles'

class SurveyTableSelector extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.updateAnswer(this.props);
    }

    updateAnswer({answer, config}) {
        answer = answer || [];
        const {rows, mode} = config;
        if(answer.length<rows.length) {
            switch(config.mode) {
                case 'select':
                    answer = rows.map((row) => [])
                    break;
                case 'order':
                    answer = rows.map((row)=>cols.map( (col) => false ))
                    break;
            }
        }
        this.setState({answer})
    }

    componentWillReceiveProps = (nextProps) => {
        if (nextProps.answer != this.props.answer) {
            this.updateAnswer(nextProps);
        }
    }

    onChoiceSelect(rowIdx, colIdx) {
        let {answer} = this.state;
        const {config:{optionsMin, optionsMax, rows}, onChange} = this.props;
        const index = answer[rowIdx].indexOf(colIdx);
        if (index<0) {
            answer[rowIdx].push(colIdx);
        } else {
            answer[rowIdx].splice(index, 1);
        }
        this.setState({answer});
        let validate = true;
        answer.forEach(e => {
            if (e.length<optionsMin || e.length>optionsMax)
                validate = false;
        });
        onChange(answer, validate);
    }

    renderCell(config, rowIdx, colIdx) {
        const {answer} = this.state
        const cell = config.rows[rowIdx][colIdx];
        switch(cell.type) {
            case 'text':
                return (<Button 
                    style={styles.buttonStyle}
                    transparent={!answer[rowIdx].includes(colIdx)}
                    onPress={() => this.onChoiceSelect(rowIdx, colIdx) }>
                    <Text>{cell.text}</Text>
                    </Button>)
            case 'file':
                return (<TouchableOpacity key={colIdx} onPress={() => {
                    this.onChoiceSelect(rowIdx, colIdx)
                }}>
                <Image style={answer[rowIdx].includes(colIdx) ? { ...this.imageStyle, borderWidth: 3, borderColor: '#ee5555'} : this.imageStyle} source={{uri: randomLink(config.rows[rowIdx][colIdx].file)}}/>
                </TouchableOpacity>)
            case 'multi_sel':
                return (<TouchableOpacity style={styles.buttonStyle} transparent onPress={() => this.onMultiSelect(rowIdx, colIdx) }><CheckBox style={{marginLeft:-4}} checked={answer[rowIdx][colIdx]} onPress={() => this.onMultiSelect(rowIdx, colIdx) } /></TouchableOpacity>)
            
            default:
                  return (<Text></Text>)
      }
    }
    render() {
        const { answer, config} = this.props;
        let height = 60
        if(this.state.dimensions && config.mode == 'select') {
            height = this.state.dimensions.width/(config.colsCount + 1)
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
                {config.rows.map((cols, rowIdx) => (
                    <Row style={rowStyle} key={rowIdx}>
                        {cols.map( (cell, colIdx) => <Col key={colIdx} style={cellStyle}>{this.renderCell(config, rowIdx, colIdx)}</Col> )}
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
)(SurveyTableSelector);
