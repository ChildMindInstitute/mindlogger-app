import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Header, Title, Content, Button, Item, Label, Input, Body, Left, Right, Icon, Form, Text, Segment, Spinner, Toast } from 'native-base';

import { Actions } from 'react-native-router-flux';
import VoiceAddForm from '../components/VoiceAddForm';

import {prepareAct} from '../../../helper'
import { addAct, updateAct } from '../../../actions/api';

const voiceInitial = {frequency: '1d', timer: 0}

class VoiceAddScreen extends Component {

  constructor(props) {
    super(props);
  }

  onEditVoice = (body) => {
    let {actIndex, updateAct, acts} = this.props
    let voice = {...this.state.voice, ...body}
    let {title, ...data} = voice
    this.toggleSpinner(true)
    return prepareAct(data).then(act_data => {
      return updateAct(actIndex, {id: acts[actIndex].id, title, act_data})
    }).then(res => {
      this.toggleSpinner(false)
      Actions.pop()
    }).catch(error => {
      this.toggleSpinner(false)
      Toast.show({text: err.message, position: 'bottom', type: 'danger', buttonText: 'ok'})
    })
  }

  toggleSpinner = (show = true) => {
    this.setState({spinner: show})
  }

  onAddVoice = ({title, ...data}) => {
    const {addAct} = this.props
    this.toggleSpinner()
    prepareAct(data).then(act_data => {
      return addAct({act_data, type:'voice', title})
    })
    .then(res => {
      this.toggleSpinner(false)
      Actions.pop()
    }).catch(err => {
      console.log(err);
      this.toggleSpinner(false)
      Toast.show({text: err.message, position: 'bottom', type: 'danger', buttonText: 'ok'})
    })
  }

  componentWillMount() {
    let {acts, actIndex} = this.props
    if(actIndex!== undefined) {
      const act = acts[actIndex]
      this.setState({voice: {title: act.title, ...act.act_data}})
    } else {
      this.setState({})
    }
  }

  render() {
    const {voice, spinner} = this.state;
    let title = voice ? voice.title : "New Voice"
    return (
      <Container>
        <Header hasTabs>
          <Left>
            <Button transparent onPress={() => Actions.pop()}>
              <Icon name="arrow-back" />
            </Button>
          </Left>
          <Body>
            <Title>{title}</Title>
          </Body>
          <Right />
        </Header>
        <Content padder>
          {voice ? (<VoiceAddForm onSubmit={this.onEditVoice} initialValues={voice}/>) : (<VoiceAddForm onSubmit={this.onAddVoice} initialValues={voiceInitial}/>) }
          {spinner && <Spinner />}
        </Content>
      </Container>
    );
  }
}

const mapDispatchToProps = {
  addAct, updateAct
}

const mapStateToProps = state => ({
  acts: state.core.acts,
  themeState: state.drawer.themeState,
  user: state.core.auth,
});

export default connect(mapStateToProps, mapDispatchToProps)(VoiceAddScreen);
