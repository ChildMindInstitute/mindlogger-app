import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import { Content, List, ListItem, Text, Button, Right, Body } from 'native-base';
import { connect } from 'react-redux';
import baseTheme from '../../../themes/baseTheme'

class SurveyMultiSelector extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.setState({answer: this.props.answer})
    console.log(this.state)
  }

  render() {
    const { answer, question} = this.props
    const { text, rows } =question
    const { onSelect } = this.props
    console.log(this.state)

    return (
      <View style={baseTheme.centerCol}>
        <Text style={baseTheme.paddingView}>{text}</Text>
        <View>
        {
          rows.map((row, idx) => {
            return (
              <ListItem onPress={() => onSelect(row.value)}>
              <Text>{row.text}</Text>
              <Right>
                <Radio selected={row.value === answer} />
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
    answers: state.survey && state.survey.answers
  }),
  (dispatch) => ({
    //actions: bindActionCreators(counterActions, dispatch)
  })
)(SurveyMultiSelector);
