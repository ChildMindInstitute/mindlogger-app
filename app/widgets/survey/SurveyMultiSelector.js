import React, {Component} from 'react';
import {View} from 'react-native';
import { ListItem, Text, Right, Body, CheckBox, Radio, Toast } from 'native-base';
import { connect } from 'react-redux';

import GImage from '../../components/image/Image';

class SurveyMultiSelector extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    let answer = this.props.answer || [];
    this.onAnswer(answer);
  }

  checkValue = (value) => {
    const { config: {optionsMax, optionsMin}, onChange, answer: oldAnswer} = this.props;
    let answer = oldAnswer ? [...oldAnswer] : [];
    
    let next = false;
    if (optionsMax==1 && optionsMin==1) {
      answer = [value];
      next = true;
    } else {
      const index = answer.indexOf(value);
      if (index<0) {
        if (answer.length<optionsMax) {
          answer.push(value);
        } else {
          Toast.show({text: `You can not select more than ${optionsMax} options`, type: 'info', duration: 1000});
        }
      } else {
        if (answer.length>optionsMin) {
          answer.splice(index, 1);
        } else if (answer.length==optionsMin) {
          Toast.show({text: `You can not select less than ${optionsMin} options`, type: 'info', duration: 1000});
        }
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
