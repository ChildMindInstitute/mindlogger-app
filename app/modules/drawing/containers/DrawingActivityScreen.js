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
import Svg,{
    Line,
    Path,
    Polygon,
    Polyline,
} from 'react-native-svg'

import baseTheme from '../../../theme'
import {setDrawing} from '../actions'
import {fbUploadFile, fbSaveAnswer} from '../../../firebase'
import DrawingBoard from '../components/DrawingBoard'


class DrawingActivityScreen extends Component {
    constructor(props) {
        super(props)
        
    }

    componentWillMount() {
        this.setState({drawing: this.props.drawing, duration:0, started:false})
    }

    componentDidMount() {
        //this._play()
    }


    toggleSpinner = (show = true) => {
        this.setState({spinner: show})
    }

    onSave = () => {
        if(!this.board) return
        let {drawing} = this.state
        let result = this.board.save()
        fbSaveAnswer({...drawing, ...result, updated_at: (new Date()).getTime()})
        Actions.pop()
        
    }

    renderTimer() {
        const {duration, drawing} = this.state
        return (<View style={{alignItems: 'center'}}>
            <ProgressCircle
            percent={duration/drawing.timer*100}
            radius={30}
            borderWidth={4}
            color="#FF9933"
            shadowColor="#999"
            bgColor="#fff">
                <Text>
                { drawing.timer-duration }
                </Text>
                <Text>
                Sec
                </Text>
            </ProgressCircle>
        </View>)
    }

    onBegin = () => {
        const {drawing} = this.state
        this.board.start()
        this.setState({started:true, duration:0})
        if(drawing.timer && drawing.timer>0)
            this.startTimer()
    }

    startTimer() {
        if(this.timerId) {
            clearInterval(this.timerId)
        }
        this.timerId = setInterval(() => {
            this.setState({duration: this.state.duration+1})
            if(this.state.duration>=this.state.drawing.timer) {
                clearInterval(this.timerId)
                this.timerId = undefined
                this.board.stop()
            }
        }, 1000)
    }

    render() {
        const {drawing, spinner, started} = this.state
        return (
        <Container>
        <Header>
            <Left>
            <Button transparent onPress={() => Actions.pop()}>
            <Icon name="arrow-back" />
            </Button>
            </Left>
            <Body style={{flex:2}}>
                <Title>{drawing.title}</Title>
            </Body>
            <Right>
            </Right>
        </Header>
        <View style={{ flex: 1, margin: 20 }}>
            {drawing.timer && drawing.timer>0 ? this.renderTimer() : <Text/>}
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}} > 
                <DrawingBoard source={drawing.image_url && {uri: drawing.image_url}} disabled={!started} ref={board => this.board = board}/>
            </View>
            <View style={{alignItems:'center', marginTop:20}}>
                <Text>{drawing.instruction}</Text>
            </View> 
            <View style={{marginTop:20}}>
            <Button full block onPress={this.onBegin}><Text>{started ? 'Redo' : 'Begin'}</Text></Button>
            </View>
            <View style={{marginTop:20}}>
                <Button full block onPress={this.onSave} disabled={spinner || !started}><Text>Save</Text>{spinner && <Spinner />}</Button>
            </View>
        </View>
        </Container>
        )
    }
}

export default connect(state => ({
    drawing: state.drawing.drawing_in_action,
  }),
  (dispatch) => bindActionCreators({setDrawing}, dispatch)
)(DrawingActivityScreen);


