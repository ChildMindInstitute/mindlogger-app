import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import { Content, List, ListItem, Text, Button, Right, Body, CheckBox } from 'native-base';
import { connect } from 'react-redux';

import baseTheme from '../../../../themes/baseTheme';
import {randomLink} from '../../../../helper';
import { CachedImage } from 'react-native-img-cache';

class SurveyMultiSelector extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
  }

  checkValue = (value) => {
    const { config: {optionsMax, optionsMin, options}, onChange, onNextChange} = this.props;
    let answer = this.props.answer || [];
    const index = answer.indexOf(value);
    if (index<0) {
      answer.push(value);
    } else {
      answer.splice(index, 1);
    }
    if (optionsMax==1 && optionsMin==1) {
      if (answer.length > 0)
        onNextChange(options[answer[0]].screen);
      else
        onNextChange(undefined);
    }
    let validated = (answer.length<=optionsMax) && (answer.length>=optionsMin);
    onChange(answer, validated);
  }

  render() {
    const { config: {options, optionsMax, optionsMin}, answer} = this.props;
    return (
      <View style={{alignItems:'stretch'}}>
        <View>
        {
          options.map((row, idx) => {
            return (
              <ListItem key={idx} onPress={() => this.checkValue(idx)}>
                <Body>
                  {row.type == 'text' &&  <Text>{row.text}</Text>}
                  {row.type == 'file' &&  <CachedImage source={{uri: randomLink(row.file)}}/>}
                </Body>
                <Right>
                  <CheckBox onPress={() => this.checkValue(idx)} checked={answer && answer.includes(idx)} />
                </Right>
              </ListItem>
              )
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
