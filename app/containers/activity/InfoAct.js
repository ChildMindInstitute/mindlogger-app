import React, { Component } from 'react';
import { StatusBar} from 'react-native';
import { Container} from 'native-base';
import { Actions } from 'react-native-router-flux';

import baseTheme from '../../themes/baseTheme';

import InfoHeader from '../../components/header/info';
import ActProgress from '../../components/progress';
import Screen from './screen';

export default class InfoAct extends Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    this.setState({index: 0, answers:[]});
  }

  render() {
    const {act} = this.props;
    const {meta: data} = act;
    const {index, answers} = this.state;
    return (
      <Container>
        <StatusBar barStyle='light-content'/>
        <InfoHeader title={act.name}/>
        { data.display && data.display.progress && <ActProgress index={index+1} length={data.screens.length} /> }
        { data.screens && 
        <Screen
          key={index}
          index={index}
          path={act._id}
          name={data.screens[index]['name']}
          answer={answers[index]}
          onPrev={this.prev}
          onNext={this.next}
          globalConfig={data}
          info={true}
          length={data.screens.length}
          />}
      </Container>
      );
  }

  prev = (answer) => {
    let {index, answers} = this.state;
    answers[index] = answer;
    let prevIndex = index - 1;
    console.log(answers);
    while(prevIndex>=0) {
      if(answers[prevIndex]['@id']) {
        this.setState({index: prevIndex, answers});
        return;
      }
      prevIndex = prevIndex - 1;
    }
    if (prevIndex<0) {
      Actions.pop();
    }
  }

  next = (answer, index) => {
    const {act: {meta: data}} = this.props;
    const {answers} = this.state;
    const oldIndex = this.state.index;
    answers[oldIndex] = answer;
    const newIndex = index || oldIndex+1;
    if (newIndex<data.screens.length) {
      for (let i = oldIndex + 1; i < newIndex; i++) {
        answers[i] = {}
      }
      this.setState({index: newIndex, answers});
    } else {
      Actions.pop();
    }
  }
}
