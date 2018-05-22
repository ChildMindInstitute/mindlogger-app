import React,{PropTypes, Component} from 'react';
import {
StyleSheet,
    View,
} from 'react-native';


import  WaveForm  from 'react-native-audiowaveform'

export default class WaveformWrapper extends Component {
    constructor(props) {
        super(props);
        this.state = {
            playAudio:false,
            stopAudio:true,
        }
    }
    static propTypes = {
        ...WaveForm.propTypes,

    }


    changestate = () => {
        if(this.timerId)
            clearTimeout(this.timerId)
        if(!this.state.playAudio) {
            this.timerId = setTimeout(() => {
                clearTimeout(this.timerId)
                if(this.state.playAudio)
                    this.changestate()
            }, (this.props.duration+0.5)*1000)
        }
        console.log(this.props.duration,this.state.playAudio)
        this.setState({playAudio: !this.state.playAudio})

        console.log("GTGTGTGTGTGTGGTGG "+this.state.playAudio);
        
    }



    componentDidMount() {
        console.log('WaveformWrapper menu mounted');
    }
    render() {

        //WaveForm.testCallback((res) => console.log|("CDCDCDCDC :::: "+res));

        return (
            <WaveForm style={this.props.style}
                onPress = {(sender) => this.changestate() }
                source={this.props.source}
                stop={this.state.stopAudio? true:false}
                play={this.state.playAudio? true:false}
                autoPlay={this.props.autoPlay}
                waveFormStyle={{waveColor:this.props.waveFormStyle.waveColor,scrubColor:this.props.waveFormStyle.scrubColor}}
            />
        );


    }

}



var styles = StyleSheet.create({
    mainView: {
        flex: 1,



    },
    base64: {
        flex: 1,

        resizeMode: 'contain',
    },
    descriptionText: {
        fontSize: 13,
        fontWeight: 'normal',
        color:'#FFFFFF',
        margin: 10,
        textAlign: 'center',
        fontFamily: 'OpenSans-Italic'


    },

    listView: {
        flex: 1,


    },
    menuItemText:{
        fontFamily: 'Verdana',
        fontWeight: '100',
        fontSize: 14,
        textAlign: 'left',
        margin: 10,
        color: '#FFFFFF',
        fontFamily: 'OpenSans-Light'
    }
});