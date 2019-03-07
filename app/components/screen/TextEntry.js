import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import { Content, List, ListItem, Text, Button, Right, Body, Item, Input } from 'native-base';
import { connect } from 'react-redux';

import baseTheme from '../../theme';

class TextEntry extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { answer, config, onChange, ...props} = this.props
    return (
      <View {...props}>
        { config.display && (
          <Text>{config.label}</Text>
          ) }
          <Item>
          <Input placeholder='Please type text'
            onChangeText={onChange}
            value={answer}
            />
          </Item>
      </View>
    )
  }
}

export default connect(state => ({
    
  }),
  (dispatch) => ({
    //actions: bindActionCreators(counterActions, dispatch)
  })
)(TextEntry);
