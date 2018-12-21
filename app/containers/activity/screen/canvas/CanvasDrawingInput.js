import React, {Component} from 'react';
import {StyleSheet} from 'react-native';
import { Text, View } from 'native-base';
import DrawingBoard from '../../../../components/drawing/DrawingBoard';



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

export default class CanvasDrawingInput extends Component {
    constructor(props) {
        super(props)
        
    }

    componentWillMount() {
        this.setState({drawing: this.props.config, duration:0, started:true})
    }

    componentDidMount() {
        //this._play()
    }

    toggleSpinner = (show = true) => {
        this.setState({spinner: show})
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

    resetData = () => {
        this.board.reset();
    }

    render() {
        const {started} = this.state;
        const {onChange, config} = this.props;
        //let timeStr = zeroFill(Math.floor(duration/60), 2) + ':' + zeroFill(Math.floor(duration%60), 2);
        return (
        <View>
            
            <DrawingBoard
                sourceFiles={config.mode == 'picture' && config.pictureFiles}
                autoStart={true}
                disabled={!started}
                ref={board => this.board = board}
                onResult={onChange}/>
            { config.instruction && <Text style={styles.text}>{config.instruction}</Text> }
        </View>
        )
    }
}

