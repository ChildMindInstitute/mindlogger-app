import React, { Component } from 'react';
import { connect } from 'react-redux';
import {StyleSheet, View, StatusBar} from 'react-native';
import { Container, Content, Text, Button, Center } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { bindActionCreators } from 'redux';

import baseTheme from '../../themes/baseTheme';
import { getItems, getObject, getFolders } from '../../actions/api';
import { setAnswer } from '../../actions/coreActions';
import ActHeader from '../../components/header';
import ActProgress from '../../components/progress';
import Screen from './screen';

class Act extends Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    this.setState({index: 0});
  }

  render() {
    const {act} = this.props;
    const {meta: data} = act;
    const {index} = this.state;
    const screenPath = data.screens[index]['@id'];
    return (
      <Container>
        <StatusBar barStyle='light-content'/>
        <ActHeader title={act.name} />
        { data.display && data.display.progress && <ActProgress index={index+1} length={data.screens.count} /> }
        <Screen
          key={index}
          path={screenPath}
          answer={answers[index]}
          onPrev={this.prev}
          onNext={this.next}
          />
      </Container>
      );
  }

  prev = () => {
    const {answers, act: {meta: data}} = this.props;
    let {index} = this.state;
    let prevIndex = index - 1;
    while(prevIndex>=0) {
      if(answers[prevIndex]['@id']) {
        this.setState({index: prevIndex});
        break;
      }
      prevIndex = prevIndex - 1;
    }
  }

  next = (answer, index) => {
    const {answers, setAnswer, act: {meta: data}} = this.props;
    const oldIndex = this.state.index;
    answers[oldIndex] = answer;
    setAnswer(answers);
    const newIndex = index || oldIndex+1;
    if (newIndex<data.screens.length) {
      for (let i = oldIndex + 1; i < newIndex; i++) {
        answers[i] = {}
      }
      this.setState({index: newIndex});
    } else {
      // postAnswer(answers)
      Actions.pop();
    }
  }
}

export default connect(state => ({
    act: state.core.act,
    answers: (state.core.answerData && state.core.answerData[state.core.act._id]) || [], 
  }),
  {
    getObject, getItems, setAnswer
  }
)(Act);
