import React, {Component} from 'react';
import {StyleSheet, StatusBar} from 'react-native';
import { Container, Content, Text, Button, View, Icon, Header, Left, Right, Title, Body, Spinner, Toast } from 'native-base';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions } from 'react-native-router-flux';
import Sound from 'react-native-sound';
import WaveForm from 'react-native-audiowaveform';
import ProgressCircle from 'react-native-progress-circle';
import moment from 'moment'
import Svg,{
    Line,
    Path,
    Polygon,
    Polyline,
} from 'react-native-svg'
import * as Progress from 'react-native-progress';

import baseTheme from '../../../theme'
import {setDrawing} from '../actions'
import DrawingBoard from '../components/DrawingBoard'
import { saveAnswer } from '../../../actions/api';
import ActHeader from '../../../components/header';
import { zeroFill } from '../../../helper';

const styles=StyleSheet.create({
    board: {

    },
    text: {
        padding: 20,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 15,
    },
    buttonText: {
      width: 68,
      textAlign: 'center',
    }
  });

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
        const {saveAnswer, act} = this.props
        let result = this.board.save()
        saveAnswer(act.id, act.act_data, result).then(res => {
            Actions.pop()
        }).catch(err => {
            this.toggleSpinner(false)
            Toast.show({text: err.message, position: 'bottom', type: 'danger', buttonText: 'ok'})
        })
    }

    renderTimer() {
        const {duration, drawing} = this.state;
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
        const {duration, drawing, spinner, started} = this.state;
        let timeStr = zeroFill(Math.floor(duration/60), 2) + ':' + zeroFill(Math.floor(duration%60), 2);
        return (
        <Container>
            <ActHeader title={this.props.act.title} />
            <Content style={{ flex: 1 }}>
                <DrawingBoard source={drawing.image_url && {uri: drawing.image_url}} disabled={!started} ref={board => this.board = board}/>
                {/* <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}} > 
                    
                </View> */}
                
                {drawing.timer && drawing.timer>0 && (<Progress.Bar progress={duration/drawing.timer} width={null} height={20}/>)}
                <Text style={styles.text}>{drawing.instruction}</Text>
            </Content>
            <View style={styles.footer}>
            <Button transparent onPress={this.redo}><Text style={styles.buttonText}>{started ? 'REDO' : ''}</Text></Button>
            <Button onPress={this.onSave}><Text style={styles.buttonText}>{this.timerId ? 'SAVE' : timeStr} </Text>{spinner && <Spinner />}</Button>
            <Button transparent onPress={this.onBegin}><Text style={styles.buttonText}>{started ? 'NEXT' : 'SKIP'}</Text></Button>
            </View>
            
        </Container>
        )
    }
}

export default connect(state => ({
    act: state.core.act,
    drawing: state.core.act.act_data,
  }),
  (dispatch) => bindActionCreators({saveAnswer}, dispatch)
)(DrawingActivityScreen);


