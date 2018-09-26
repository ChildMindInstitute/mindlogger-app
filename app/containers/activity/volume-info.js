import React, { Component } from 'react';
import { connect } from 'react-redux';
import {StyleSheet, View, StatusBar} from 'react-native';
import { Container, Content, Text, Button, Center } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { bindActionCreators } from 'redux';

import baseTheme from '../../themes/baseTheme';
import { setAnswer } from '../../actions/coreActions';
import InfoHeader from '../../components/header/info';
import ActProgress from '../../components/progress';
import Screen from './screen';

class VolumeInfo extends Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    this.setState({index: 0});
  }

  render() {
    const {act, volume} = this.props;
    const {meta: data} = act;
    const {index} = this.state;
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
          onPrev={this.prev}
          onNext={this.next}
          globalConfig={{permission: {skip: true}}}
          length={data.screens.length}
          />}
      </Container>
      );
  }

  prev = (answer) => {
    const {act: {meta: data}} = this.props;
    let {index} = this.state;
    let prevIndex = index - 1;
    if (prevIndex<0) {
      Actions.pop();
    }
  }

  next = (answer, index) => {
    const {act: {meta: data}} = this.props;
    const oldIndex = this.state.index;
    const newIndex = index || oldIndex+1;
    if (newIndex<data.screens.length) {
      this.setState({index: newIndex});
    } else {
      // postAnswer()
      Actions.pop();
    }
  }
}

export default connect(state => ({
    
  }),
  {
    
  }
)(VolumeInfo);
