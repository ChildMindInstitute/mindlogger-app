import React, {Component} from 'react';
import {StyleSheet, StatusBar, Platform} from 'react-native';
import { Container, Content, Text, Button, View, Icon, Header, Left, Right, Title, Body, Spinner, Toast } from 'native-base';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions } from 'react-native-router-flux';
import Sound from 'react-native-sound';
import WaveForm from 'react-native-audiowaveform';
import ProgressCircle from 'react-native-progress-circle'
import moment from 'moment'

import baseTheme from '../../../theme'
import {saveAnswer} from '../../../actions/api'
import AudioRecord from '../../../components/audio/AudioRecord'
import {uploadFileS3} from '../../../helper'
import WaveformWrapper from '../components/WaveformWrapper'

class VoiceActivityScreen extends Component {
    constructor(props) {
        super(props)
        
    }

    componentWillMount() {
        this.setState({voice: this.props.voice, duration:0, answer: {}})
    }

    componentDidMount() {
        //this._play()
    }

    async _play() {
        const {voice} = this.state

        // These timeouts are a hacky workaround for some issues with react-native-sound.
        // See https://github.com/zmxv/react-native-sound/issues/89.
        setTimeout(() => {
            var sound = new Sound(voice.output_path, '', (error) => {
                if (error) {
                console.log('failed to load the sound', error);
                }
            });

            setTimeout(() => {
                sound.play((success) => {
                if (success) {
                    console.log('successfully finished playing');
                } else {
                    console.log('playback failed due to voice decoding errors');
                }
                });
            }, 100);
        }, 100);
    }

    onRecordStart = (filePath) => {
        let {voice} = this.state
        voice.output_path = undefined
        this.setState({voice})
    }

    onRecordProgress = (duration) => {
        this.setState({duration})
        console.log("progress", duration)
    }

    onRecordFile = (output_path, duration) => {
        this.setState({answer: {output_path, duration}})
        this.toggleToPlay()
    }

    toggleSpinner = (show = true) => {
        this.setState({spinner: show})
    }

    onSave = () => {
        const {saveAnswer, act} = this.props
        const {output_path, duration} = this.state.answer
        this.toggleSpinner()
        let filename = `${act.title}_VOICE_${moment().format('M-D-YYYY_HHmmss')}`;
        filename = filename + (Platform.OS == 'android' ? '.mp3' : '.aac')
        uploadFileS3(output_path, 'voices/', filename).then(url => {
            return saveAnswer(act.id, act.act_data, {duration, output_url: url})
        }).then(res => {
            Actions.pop()
        }).catch(err => {
            this.toggleSpinner(false)
            Toast.show({text: err.message, position: 'bottom', type: 'danger', buttonText: 'ok'})
        })
    }

    toggleToPlay = () => {
        console.log(this.props)
        if(this.state.playAudio)
            return;
        this.setState({playAudio: true})
        setTimeout(() => {
            this.setState({playAudio: false})
        }, this.props.voice.duration*1000)
    }
    renderTimer() {
        const {duration, voice} = this.state
        console.log(duration)
        return (<View style={{alignItems: 'center'}}>
            <ProgressCircle
            percent={duration/voice.timer*100}
            radius={30}
            borderWidth={4}
            color="#FF9933"
            shadowColor="#999"
            bgColor="#fff">
                <Text>
                { Math.floor(voice.timer-duration) }
                </Text>
                <Text>
                Sec
                </Text>
            </ProgressCircle>
        </View>)
    }
    renderWaveForm(answer) {
        return (<WaveformWrapper
            source={{uri:`${answer.output_path}`}}
            waveFormStyle={{waveColor:'blue', scrubColor:'red'}}
            style={{
                flex:1,
            }}
            duration = {answer.duration}
        >
        </WaveformWrapper>)
    }
    render() {
        const {voice, spinner, answer} = this.state
        const {act} = this.props
        return (
        <Container>
        <Header>
            <Left>
            <Button transparent onPress={() => Actions.pop()}>
            <Icon name="arrow-back" />
            </Button>
            </Left>
            <Body style={{flex:2}}>
                <Title>{act.title}</Title>
            </Body>
            <Right>
            </Right>
        </Header>
        <View style={{ flex: 1, margin: 20 }}>
            {voice.timer && voice.timer>0 && this.renderTimer() || false}
            
            <View style={{flex: 1, justifyContent:'center', alignItems: 'center'}}>
                <View style={{height: 200, width: '100%', backgroundColor:'white'}}>
                {answer.output_path && this.renderWaveForm(answer)}
                </View>
            </View>
            <View style={{alignItems:'center', marginTop:20}}>
                <Text>{voice.instruction}</Text>
            </View>
            <View style={{marginTop:20}}>
                <AudioRecord timeLimit={voice.timer} mode="single" onStart={this.onRecordStart} onProgress={this.onRecordProgress} onRecordFile={this.onRecordFile} recordLabel={answer.output_path ? "Redo":"Begin"}/>
            </View>
            <View style={{marginTop:20}}>
                <Button full block onPress={this.onSave} disabled={spinner}><Text>Save</Text>{spinner && <Spinner /> || false }</Button>
            </View>
        </View>
        </Container>
        )
    }
}

export default connect(state => ({
    act: state.core.act,
    voice: state.core.act.act_data,
  }),
  (dispatch) => bindActionCreators({saveAnswer}, dispatch)
)(VoiceActivityScreen);


