import React, { Component } from 'react';
import { connect } from 'react-redux';
import {StyleSheet, View, StatusBar} from 'react-native';
import { Container, Content, Text, Button, Center } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { bindActionCreators } from 'redux';

import baseTheme from '../../themes/baseTheme';
import { getItems, getObject, getFolders } from '../../actions/api';
import ActHeader from '../../components/header';
import ActProgress from '../../components/progress';
import Screen from './screen';

class Act extends Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    console.log(this.props.act);
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
        <Screen key={index} path={screenPath} onMove={this.onMove} onAction={this.onAction}/>
      </Container>
      );
  }
}

export default connect(state => ({
    act: state.core.act
  }),
  {
    getObject, getItems
  }
)(Act);
