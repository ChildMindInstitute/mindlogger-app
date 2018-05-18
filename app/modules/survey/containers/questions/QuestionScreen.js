import React, {Component} from 'react';
import {StyleSheet, StatusBar, Image} from 'react-native';
import { Container, Content, Text, Button, View, Icon, Header, Left, Right, Title, Body, Thumbnail, Item } from 'native-base';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions } from 'react-native-router-flux';
import * as Progress from 'react-native-progress';

import SortableGrid from 'react-native-sortable-grid';
import randomString from 'random-string';

import SurveyTextInput from '../../components/SurveyTextInput';
import SurveyBoolSelector from '../../components/SurveyBoolSelector';
import SurveySingleSelector from '../../components/SurveySingleSelector';
import SurveyMultiSelector from '../../components/SurveyMultiSelector';
import SurveyImageSelector from '../../components/SurveyImageSelector';

const styles=StyleSheet.create({
  body: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  footerText: {
    fontSize: 20,
    fontWeight: '300',
  }
});
export default class extends Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    this.setState({});
  }

  onInputAnswer = (result, data=undefined, final=false) => {
    let {onSave, onNext} = this.props;
    let answer = {
      result,
      time: Date.now(),
    };

    onSave(answer);
    
    if(final)
      setTimeout(() => { onNext() }, 500)
  }

  render() {
    const { question, answer, onSave, onPrev, onNext} = this.props;
    let scroll = true;
    let comp = (<View></View>);
    switch(question.type) {
      case 'text':
        comp = (<SurveyTextInput onSelect={this.onInputAnswer} data={{question, answer}} />);
        break;
      case 'bool':
        comp = (<SurveyBoolSelector onSelect={this.onInputAnswer} data={{question, answer}}/>);
        break;
      case 'single_sel':
        comp = (<SurveySingleSelector onSelect={this.onInputAnswer} data={{question, answer}}/>);
        break;
      case 'multi_sel':
        comp = (<SurveyMultiSelector onSelect={this.onInputAnswer} data={{question, answer}}/>);
        break;
      case 'image_sel':
        comp = (<SurveyImageSelector onSelect={this.onInputAnswer} data={{question, answer}}/>);
        break;
    }

    return (
      <View style={styles.body}>
        <Content padder>
          {comp}
        </Content>
        <View style={styles.footer}>
          <Button transparent onPress={() => onPrev()}>
            <Icon name="arrow-back" />
          </Button>
          <Button transparent onPress={() => onNext()}><Text style={styles.footerText}>{ answer === undefined ? "SKIP" : "NEXT" }</Text></Button>
        </View>
      </View>
      );
  }
}
