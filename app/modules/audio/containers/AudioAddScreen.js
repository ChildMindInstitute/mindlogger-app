import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Header, Title, Content, Button, Item, Label, Input, Body, Left, Right, Icon, Form, Text, Segment, Spinner } from 'native-base';

import { Actions } from 'react-native-router-flux';
import AudioAddForm from '../components/AudioAddForm';
import {addAudioActivity, updateAudioActivity} from '../actions'
import {fbAddActivity, fbUploadFile} from '../../../firebase'


class AudioAddScreen extends Component {

  constructor(props) {
    super(props);
  }

  onEditAudio = (body) => {
    let {audioIdx} = this.props
    let audio = {...this.state.audio, ...body}
    this.props.updateAudio(audioIdx, audio)
    Actions.pop()
  }

  toggleSpinner = (show = true) => {
    this.setState({spinner: show})
  }

  onAddAudio = (body) => {
    let {addAudio} = this.props
    let data = {...body, 'activity_type':'audio'}
    var filename = data.audio_path.replace(/^.*[\\\/]/, '')
    this.toggleSpinner()
    return fbUploadFile(data.audio_path,`audios/${filename}`).then(url => {
      this.toggleSpinner(false)
      data.audio_url = url
      const key = fbAddActivity('audios', data, result => {
        console.log("pushed", result)
      })
      return addAudio({...data, key})
    }).catch(error => {
      this.toggleSpinner(false)
      console.log(error)
    })
  }

  componentWillMount() {
    let {audios, audioIdx} = this.props
    if(audioIdx) {
      const audio = audios[audioIdx]
      this.setState({audio})
    } else {
      this.setState({})
    }
  }

  render() {
    const {audio, spinner} = this.state;
    let title = audio ? audio.title : "New Audio"
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
          {audio ? (<AudioAddForm onSubmit={this.onEditAudio} initialValues={audio}/>) : (<AudioAddForm onSubmit={this.onAddAudio}/>) }
          {spinner && <Spinner />}
        </Content>
      </Container>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  addAudio: body => {
    dispatch(addAudioActivity(body))
    Actions.pop()
  },
  updateAudio: (audioIdx, body) => dispatch(updateAudioActivity(audioIdx, body))
})

const mapStateToProps = state => ({
  audios: state.audio.audios,
  themeState: state.drawer.themeState,
});

export default connect(mapStateToProps, mapDispatchToProps)(AudioAddScreen);
