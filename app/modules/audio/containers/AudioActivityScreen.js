import React, {Component} from 'react';
import {StyleSheet, StatusBar} from 'react-native';
import { Container, Content, Text, Button, View, Icon, Header, Left, Right, Title, Body } from 'native-base';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions } from 'react-native-router-flux';
import Sound from 'react-native-sound';
import WaveForm from 'react-native-audiowaveform';
import ProgressCircle from 'react-native-progress-circle'

import baseTheme from '../../../theme'
import {setAudio} from '../actions'
import AudioRecord from '../../../components/audio/AudioRecord'

class AudioActivityScreen extends Component {
    constructor(props) {
        super(props)
        
    }

    componentWillMount() {
        
        this.setState({audio: this.props.audio, duration:0})
    }

    componentDidMount() {
        //this._play()
    }

    async _play() {
        const {audio} = this.state

        // These timeouts are a hacky workaround for some issues with react-native-sound.
        // See https://github.com/zmxv/react-native-sound/issues/89.
        setTimeout(() => {
            var sound = new Sound(audio.output_path, '', (error) => {
                if (error) {
                console.log('failed to load the sound', error);
                }
            });

            setTimeout(() => {
                sound.play((success) => {
                if (success) {
                    console.log('successfully finished playing');
                } else {
                    console.log('playback failed due to audio decoding errors');
                }
                });
            }, 100);
        }, 100);
    }

    onRecordStart = (filePath) => {
        let {audio} = this.state
        audio.output_path = undefined
        this.setState({audio})
    }

    onRecordProgress = (duration) => {
        this.setState({duration})
        console.log("progress", duration)
    }

    onRecordFile = (filePath, duration) => {
        let {audio, setAudio} = this.props
        audio.output_path = filePath
        audio.duration = duration
        setAudio(audio)
        this.toggleToPlay()
    }

    onSave = () => {
        Actions.pop()
    }

    toggleToPlay() {
        if(this.state.playAudio)
            return;
        this.setState({playAudio: true})
        setTimeout(() => {
            this.setState({playAudio: false})
        }, this.props.audio.duration*1000)
    }
    renderTimer() {
        const {duration, audio} = this.state
        console.log(duration)
        return (<View style={{alignItems: 'center'}}>
            <ProgressCircle
            percent={duration/audio.timer*100}
            radius={30}
            borderWidth={4}
            color="#FF9933"
            shadowColor="#999"
            bgColor="#fff">
                <Text>
                { audio.timer }
                </Text>
                <Text>
                Sec
                </Text>
            </ProgressCircle>
        </View>)
    }
    renderWaveForm(audio) {
        return (<WaveForm
            source={{uri:`${audio.output_path}`}}
            waveFormStyle={{waveColor:'blue', scrubColor:'red'}}
            style={{
                flex:1,
            }}
            onPress = {(sender) => this.toggleToPlay() }
            play={this.state.playAudio? true:false}
        >
        </WaveForm>)
    }
    render() {
        const {audio} = this.state
        
        return (
        <Container>
        <Header>
            <Left>
            <Button transparent onPress={() => Actions.pop()}>
            <Icon name="arrow-back" />
            </Button>
            </Left>
            <Body style={{flex:2}}>
                <Title>{audio.title}</Title>
            </Body>
            <Right>
            </Right>
        </Header>
        <View style={{ flex: 1, margin: 20 }}>
            {audio.timer && audio.timer>0 && this.renderTimer()}
            
            <View style={{flex: 1, justifyContent:'center', alignItems: 'center'}}>
                <View style={{height: 200, width: '100%', backgroundColor:'white'}}>
                {audio.output_path && this.renderWaveForm(audio)}
                </View>
            </View>
            <View style={{alignItems:'center', marginTop:20}}>
                <Text>{audio.instruction}</Text>
            </View>
            <View style={{marginTop:20}}>
                <AudioRecord timeLimit={audio.timer} mode="single" onStart={this.onRecordStart} onProgress={this.onRecordProgress} onRecordFile={this.onRecordFile} recordLabel={audio.output_path ? "Redo":"Begin"}/>
            </View>
            <View style={{marginTop:20}}>
                <Button full block onPress={this.onSave}><Text>Save</Text></Button>
            </View>
        </View>
        </Container>
        )
    }
}

export default connect(state => ({
    audio: state.audio.audio_in_action,
  }),
  (dispatch) => bindActionCreators({setAudio}, dispatch)
)(AudioActivityScreen);


