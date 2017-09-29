import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import { Content, List, ListItem, Text, Button, Right, Body } from 'native-base';
import { connect } from 'react-redux';
import baseTheme from '../../../themes/baseTheme'

class SurveyBoolSelector extends Component {
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

    let texts = rows ? rows : ["YES", "NO"]
    let values = [true, false]
    console.log(this.state)

    return (
      <View style={baseTheme.centerCol}>
      <Text style={baseTheme.paddingView}>{text}</Text>
      <View style={baseTheme.spacedRow}>
      { texts.map((text, idx) => {
        if (values[idx] === this.state.answer) {
          return (<Button success onPress={() => { onSelect(values[idx]) }} key={idx}><Text>{text}</Text></Button>)
        } else {
          return (<Button light onPress={() => { 
            this.setState({ answer: values[idx] })
            onSelect(values[idx]) 
          }} key={idx}><Text>{text}</Text></Button>)
        }
      })}
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
)(SurveyBoolSelector);
