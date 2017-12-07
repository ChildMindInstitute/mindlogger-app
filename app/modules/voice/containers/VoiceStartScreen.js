import React, {Component} from 'react';
import {StyleSheet, StatusBar} from 'react-native';
import { Container, Content, Text, Button, View, Icon, Header, Left, Right, Title, Body, Spinner } from 'native-base';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions } from 'react-native-router-flux';
import {
    Player,
    MediaStates
  } from 'react-native-audio-toolkit';

import baseTheme from '../../../theme'
import {setVoice} from '../actions'
import AudioRecord from '../../../components/audio/AudioRecord'

class VoiceStartScreen extends Component {
    constructor(props) {
        super(props)
        
    }

    componentWillMount() {
        this.setState({voice: this.props.voice})
    }

    componentDidMount() {
        this.player = new Player(this.props.voice.audio_url, {
            autoDestroy: true
        }).prepare((err) => {
            if (err) {
                console.log('error at _reloadPlayer():');
                console.log(err);
            } else {
                this.player.playPause((err, playing) => {
                })
            }
        });
    }

    toggleSpinner = (show = true) => {
        this.setState({spinner: show})
    }

    onBegin = () => {
        Actions.replace("voice_activity")
    }

    render() {
        const {voice, spinner} = this.state
        return (
        <Container>
        <Header>
            <Left>
            <Button transparent onPress={() => Actions.pop()}>
            <Icon name="arrow-back" />
            </Button>
            </Left>
            <Body style={{flex:2}}>
                <Title>{voice.title}</Title>
            </Body>
            <Right>
            </Right>
        </Header>
        <View style={{ flex: 1 }}>
            {spinner && <Spinner />}
            <View style={{alignItems:'center', flexDirection: 'row', flex: 1}}>
                <View style={baseTheme.centerRow}>
                    <Icon name="mic" style={{fontSize:180}} />
                </View>
            </View>
            <View style={{alignItems:'center'}}>
                <Text style={{margin:20}}>{voice.instruction}</Text>
            </View>
            <View style={{margin: 20}}>
            <Button full onPress={this.onBegin}><Text>Begin</Text></Button>
            </View>
        </View>
        </Container>
        )
    }
}

export default connect(state => ({
    voice: state.voice.voice_in_action,
  }),
  (dispatch) => bindActionCreators({setVoice}, dispatch)
)(VoiceStartScreen);


