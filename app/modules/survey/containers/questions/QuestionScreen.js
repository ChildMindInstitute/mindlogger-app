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
    const {answer} = this.props;
    this.setState({answer});
  }

  onInputAnswer = (result, data=undefined, final=false) => {
    let {onSave, onNext} = this.props;
    let answer = {
      result,
      time: Date.now(),
    };
    
    if(final) {
      this.setState({answer});
      onSave(answer);
      setTimeout(() => { onNext() }, 500);
    } else {
      this.setState({answer});
    }
      
  }

  saveAndNext = () => {
    let {onSave, onNext} = this.props;
    onSave(this.state.answer);
    setTimeout(() => { onNext() }, 500);
  }

  render() {
    const { question, onSave, onPrev, onNext} = this.props;
    const answer = this.state.answer && this.state.answer.result;
    const isSkip = this.props.answer && this.props.answer.result;
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
      case 'image_multi_sel':
        comp = (<SurveyImageSelector onSelect={this.onInputAnswer} multi data={{question, answer}}/>);
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
          {answer !== undefined && <Button onPress={this.saveAndNext}><Text style={styles.footerText}>Save</Text></Button> }
          <Button transparent onPress={() => onNext()}>{ isSkip ? <Text style={styles.footerText}>SKIP</Text> : <Icon name="arrow-forward" /> }</Button>
        </View>
      </View>
      );
  }
}
