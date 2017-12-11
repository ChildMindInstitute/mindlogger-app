import React, {Component} from 'react';
import {StyleSheet, StatusBar} from 'react-native';
import { Container, Content, Text, Button, View, Icon, Header, Left, Right, Title, Body, Spinner, Toast } from 'native-base';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions } from 'react-native-router-flux';
import Sound from 'react-native-sound';
import WaveForm from 'react-native-audiowaveform';
import ProgressCircle from 'react-native-progress-circle'
import moment from 'moment'

import baseTheme from '../../../theme'
import {setVoice} from '../actions'
import AudioRecord from '../../../components/audio/AudioRecord'
import {fbUploadFile, fbSaveAnswer} from '../../../firebase'
import WaveformWrapper from '../components/WaveformWrapper'

class VoiceActivityScreen extends Component {
    constructor(props) {
        super(props)
        
    }

    componentWillMount() {
        
        this.setState({voice: this.props.voice, duration:0})
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

    onRecordFile = (filePath, duration) => {
        let {voice, setVoice} = this.props
        voice.output_path = filePath
        voice.duration = duration
        setVoice(voice)
        this.toggleToPlay()
    }

    toggleSpinner = (show = true) => {
        this.setState({spinner: show})
    }

    onSave = () => {
        let {voice} = this.state
        this.toggleSpinner()
        fbUploadFile(voice.output_path, `voices/${moment(voice.updated_at).format('M-D-YYYY')}.aac`).then((url)=>{
            fbSaveAnswer({...voice, output_url: url, updated_at: (new Date()).getTime()})
            Actions.pop()
        }).catch((error)=> {
            this.toggleSpinner(false)
            Toast.show({text: error.message, position: 'bottom', type: 'danger', buttonText: 'ok'})
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
    renderWaveForm(voice) {
        return (<WaveformWrapper
            source={{uri:`${voice.output_path}`}}
            waveFormStyle={{waveColor:'blue', scrubColor:'red'}}
            style={{
                flex:1,
            }}
            duration = {voice.duration}
        >
        </WaveformWrapper>)
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
        <View style={{ flex: 1, margin: 20 }}>
            {voice.timer && voice.timer>0 && this.renderTimer()}
            
            <View style={{flex: 1, justifyContent:'center', alignItems: 'center'}}>
                <View style={{height: 200, width: '100%', backgroundColor:'white'}}>
                {voice.output_path && this.renderWaveForm(voice)}
                </View>
            </View>
            <View style={{alignItems:'center', marginTop:20}}>
                <Text>{voice.instruction}</Text>
            </View>
            <View style={{marginTop:20}}>
                <AudioRecord timeLimit={voice.timer} mode="single" onStart={this.onRecordStart} onProgress={this.onRecordProgress} onRecordFile={this.onRecordFile} recordLabel={voice.output_path ? "Redo":"Begin"}/>
            </View>
            <View style={{marginTop:20}}>
                <Button full block onPress={this.onSave} disabled={spinner}><Text>Save</Text>{spinner && <Spinner />}</Button>
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
)(VoiceActivityScreen);


