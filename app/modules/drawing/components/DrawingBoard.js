import React, {Component} from 'react';
import {StyleSheet, StatusBar, View, PanResponder, Image} from 'react-native';
import {Icon} from 'native-base';
import { connect } from 'react-redux';

import Svg,{
    Line,
    Path,
    Polygon,
    Polyline,
} from 'react-native-svg'

function chunckedPointStr(lines, chunk_size){
    var results = [];
    lines.forEach(line => {
        let length = line.points.length
        for (var index = 0; index < length ; index += chunk_size) {
            myChunk = line.points.slice(index, index+chunk_size+1);
            // Do something if you want with the group
            results.push(myChunk.map(point => point.join(",")).join(" "));
        }
    });
    return results;
}


export default class DrawingBoard extends Component {
    constructor(props) {
        super(props)
        this.allowed = false
        this.startX = 0
        this.startY = 0
        this.lastX = 0
        this.lastY = 0
    }

    addLine = (evt, gestureState) => {
        const {lines} = this.state;
        if(!this.allowed) return
        const {locationX, locationY} = evt.nativeEvent
        this.startX = locationX
        this.startY = locationY
        lines.push({points:[[locationX,locationY]]})
        this.setState({lines})
    }

    addPoint = (evt, gestureState) => {
        const {lines, dimensions} = this.state
        if(!this.allowed) return
        let n = lines.length-1
        const {moveX, moveY, x0, y0} = gestureState
        const x = moveX-x0+this.startX
        const y = moveY-y0+this.startY
        if((Math.abs(this.lastX-x)>10) || (Math.abs(this.lastY-y)>10)) {
            this.lastX = x
            this.lastY = y
            lines[n].points.push([this.lastX,this.lastY])
            this.setState({lines})
        }
    }

    componentWillMount() {
        this._panResponder = PanResponder.create({
            // Ask to be the responder:
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      
            onPanResponderGrant: this.addLine,
            onPanResponderMove: this.addPoint,
            onPanResponderTerminationRequest: (evt, gestureState) => true,
            onPanResponderRelease: (evt, gestureState) => {
              // The user has released all touches while this view is the
              // responder. This typically means a gesture has succeeded
            },
            onPanResponderTerminate: (evt, gestureState) => {
              // Another component has become the responder, so this gesture
              // should be cancelled
            },
            onShouldBlockNativeResponder: (evt, gestureState) => {
              // Returns whether this component should block native components from becoming the JS
              // responder. Returns true by default. Is currently only supported on android.
              return true;
            },
          });
        this.setState({lines: this.props.lines || []})
    }

    renderLine(pointStr, idx) {
        return (<Polyline key={idx}
            points={pointStr}
            fill= 'none'
            stroke="black"
            strokeWidth="3"
        />)
    }

    onMove = (evt) => {
        console.log(evt)
    }
    reset(){
        this.setState({lines:[]})
    }
    start() {
        this.reset()
        this.allowed = true
    }

    stop() {
        this.allowed = false
    }

    save() {
        return this.state.lines
    }

    render() {
        const {lines, dimensions} = this.state
        const {placeholder} = this.props
        if (dimensions) {
            var { width, height } = dimensions
        }
        const strArray = chunckedPointStr(lines,50)
        return (
            
            <View style={{width: 300, height: 200, alignItems: 'center', backgroundColor: 'white'}} onLayout={this.onLayout} {...this._panResponder.panHandlers}>
                {this.props.source && (<Image style={{width:300, height: 200}} source={this.props.source}/>)}
                {placeholder && (<Icon name="brush" style={{fontSize:120}}/>)}
                <View style={{width: '100%', height:'100%', position:'absolute'}}>
                    {dimensions && 
                    <Svg
                        height={height}
                        width={width}
                    >
                    {strArray.map(this.renderLine)}
                    </Svg>
                    }
                </View>
            </View>
        )
    }

    onLayout = event => {
        if (this.state.dimensions) return // layout was already called
        let {width, height, top, left} = event.nativeEvent.layout
        console.log(event.nativeEvent.layout)
        this.setState({dimensions: {width, height, top, left}})
    }
}


