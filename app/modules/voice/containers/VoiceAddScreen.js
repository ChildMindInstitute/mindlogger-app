import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Header, Title, Content, Button, Item, Label, Input, Body, Left, Right, Icon, Form, Text, Segment, Spinner } from 'native-base';

import { Actions } from 'react-native-router-flux';
import VoiceAddForm from '../components/VoiceAddForm';
import {addVoice, updateVoice} from '../actions'
import {fbAddActivity, fbUpdateActivityWithAudio, fbUploadFile} from '../../../firebase'


class VoiceAddScreen extends Component {

  constructor(props) {
    super(props);
  }

  onEditVoice = (body) => {
    let {voiceIdx} = this.props
    let voice = {...this.state.voice, ...body}
    this.props.updateVoice(voiceIdx, voice)
    this.toggleSpinner(true)
    return fbUpdateActivityWithAudio('voices', voice).then(result => {
      this.toggleSpinner(false)
      Actions.pop()
    }).catch(error => {
      this.toggleSpinner(false)
      console.log(error)
    })
  }

  toggleSpinner = (show = true) => {
    this.setState({spinner: show})
  }

  onAddVoice = (body) => {
    let {addVoice} = this.props
    let data = {...body, 'activity_type':'voice'}
    var filename = data.audio_path.replace(/^.*[\\\/]/, '')
    this.toggleSpinner()
    fbAddActivityWithAudio('audios',data,result => {
      console.log("pushed", result)
    }).then(res => {
      this.toggleSpinner(false)
      return addVoice(res)
    }).catch(err => {
      this.toggleSpinner(false)
      console.log(err)
    })
  }

  componentWillMount() {
    let {voices, voiceIdx} = this.props
    if(voiceIdx) {
      const voice = voices[voiceIdx]
      this.setState({voice})
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
          {voice ? (<VoiceAddForm onSubmit={this.onEditVoice} initialValues={voice}/>) : (<VoiceAddForm onSubmit={this.onAddVoice}/>) }
          {spinner && <Spinner />}
        </Content>
      </Container>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  addVoice: body => {
    dispatch(addVoice(body))
    Actions.pop()
  },
  updateVoice: (voiceIdx, body) => dispatch(updateVoice(voiceIdx, body))
})

const mapStateToProps = state => ({
  voices: state.voice.voices,
  themeState: state.drawer.themeState,
});

export default connect(mapStateToProps, mapDispatchToProps)(VoiceAddScreen);
