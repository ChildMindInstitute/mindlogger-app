import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import { Content, List, ListItem, Text, Button, Right, Body, CheckBox, Radio } from 'native-base';
import { connect } from 'react-redux';

import baseTheme from '../../../../themes/baseTheme';
import {randomLink} from '../../../../helper';
import GImage from '../../../../components/image/Image';

class SurveyMultiSelector extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    let answer = this.props.answer || [];
    this.onAnswer(answer);
  }

  checkValue = (value) => {
    const { config: {optionsMax, optionsMin, options}, onChange, answer: oldAnswer = []} = this.props;
    let answer = [...oldAnswer];
    
    let next = false;
    if (optionsMax==1 && optionsMin==1) {
      answer = [value];
      next = true;
    } else {
      const index = answer.indexOf(value);
      if (index<0) {
        answer.push(value);
      } else {
        answer.splice(index, 1);
      }
    }
    this.onAnswer(answer);
    let validated = (answer.length<=optionsMax) && (answer.length>=optionsMin);
    onChange(answer, validated, next);
  }

  onAnswer(answer) {
    const { config: {optionsMax, optionsMin, options}, onNextChange} = this.props;
    if (optionsMax==1 && optionsMin==1) {
      if (answer.length > 0)
        onNextChange(options[answer[0]].screen);
      else
        onNextChange(undefined);
    }
  }

  render() {
    const { config: {options, optionsMax, optionsMin}, answer} = this.props;
    let isRadio = (optionsMax == 1) && (optionsMin == 1);
    return (
      <View style={{alignItems:'stretch'}}>
        <View>
        {
          options.map((row, idx) => {
            if (row) {
              return (
                <ListItem key={idx} onPress={() => this.checkValue(idx)}>
                  <Body>
                    {row.type == 'text' &&  <Text>{row.text}</Text>}
                    {row.type == 'file' &&  <GImage file={row.file} style={{width: '60%', height: 100, resizeMode: 'cover'}}/>}
                  </Body>
                  <Right>
                    { isRadio ?
                    <Radio onPress={() => this.checkValue(idx)} selected={answer && answer.includes(idx)} />
                      :
                    <CheckBox onPress={() => this.checkValue(idx)} checked={answer && answer.includes(idx)} /> }
                  </Right>
                </ListItem>
                )
            } else {
              return (<ListItem key={idx} onPress={() => this.checkValue(idx)}>
                  <Body>
                  </Body>
                  <Right>
                    <CheckBox onPress={() => this.checkValue(idx)} checked={answer && answer.includes(idx)} />
                  </Right>
                </ListItem>)
            }
          })
        }
        </View>
      </View>
    )
  }
}

export default connect(state => ({
    
  }),
  (dispatch) => ({
    //actions: bindActionCreators(counterActions, dispatch)
  })
)(SurveyMultiSelector);
