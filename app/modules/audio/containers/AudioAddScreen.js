import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Header, Title, Content, Button, Item, Label, Input, Body, Left, Right, Icon, Form, Text, Segment } from 'native-base';

import { Actions } from 'react-native-router-flux';
import AudioAddForm from '../components/AudioAddForm';
import {addAudioActivity, updateAudioActivity} from '../actions'


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

  onAddAudio = (body) => {
    return this.props.addAudio({...body, 'activity_type':'audio'})
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
    const {audio} = this.state;
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
  navigation: state.cardNavigation,
  themeState: state.drawer.themeState,
});

export default connect(mapStateToProps, mapDispatchToProps)(AudioAddScreen);
