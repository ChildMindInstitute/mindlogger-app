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

  showInfoScreen = () => {
    Actions.push("about_act");
  }

  render() {
    const {act, info, answers} = this.props;
    const {meta: data} = act;
    const {index} = this.state;
    return (
      <Container>
        <StatusBar barStyle='light-content'/>
        <ActHeader title={act.name} onInfo={info && this.showInfoScreen}/>
        { data.display && data.display.progress && <ActProgress index={index+1} length={data.screens.length} /> }
        <Screen
          key={index}
          index={index}
          path={act._id}
          name={data.screens[index]['name']}
          answer={answers[index]}
          onPrev={this.prev}
          onNext={this.next}
          globalConfig={data}
          length={data.screens.length}
          />
      </Container>
      );
  }

  prev = (answer) => {
    const {answers, act: {meta: data}} = this.props;
    let {index} = this.state;
    answers[index] = answer;
    setAnswer(answers);
    let prevIndex = index - 1;
    while(prevIndex>=0) {
      if(answers[prevIndex]['@id']) {
        this.setState({index: prevIndex});
        return;
      }
      prevIndex = prevIndex - 1;
    }
    if (prevIndex<0) {
      Actions.pop();
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
    info: state.core.actInfo,
    answers: (state.core.answerData && state.core.answerData[state.core.act._id]) || [], 
  }),
  {
    getObject, getItems, setAnswer
  }
)(Act);
