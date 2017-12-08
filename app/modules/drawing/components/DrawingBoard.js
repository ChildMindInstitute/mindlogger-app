import React, {Component} from 'react';
import {StyleSheet, StatusBar, View, PanResponder, Image} from 'react-native';
import { connect } from 'react-redux';

import Svg,{
    Line,
    Path,
    Polygon,
    Polyline,
} from 'react-native-svg'


export default class DrawingBoard extends Component {
    constructor(props) {
        super(props)
        this.allowed = false
    }

    addLine = (evt, gestureState) => {
        const {lines} = this.state;
        if(!this.allowed) return
        lines.push({points:[[evt.nativeEvent.locationX,evt.nativeEvent.locationY]]})
        this.setState({lines})
    }

    addPoint = (evt, gestureState) => {
        const {lines, dimensions} = this.state
        if(!this.allowed) return
        let n = lines.length-1
        lines[n].points.push([evt.nativeEvent.locationX,evt.nativeEvent.locationY])
        this.setState({lines})
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

    renderLine(line, idx) {
        const pointStr = line.points.map(point => point.join(",")).join(" ")
        return (<Polyline key={idx}
            points={pointStr}
            fill={line.fill || 'none'}
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

    save() {
        return this.state.lines
    }

    render() {
        const {lines, dimensions} = this.state
        if (dimensions) {
            var { width, height } = dimensions
        }
        return (
            
            <View style={{width: 300, height: 200, alignItems: 'center', backgroundColor: 'white'}} onLayout={this.onLayout} {...this._panResponder.panHandlers}>
                <Image style={{width:300, height: 200}} source={this.props.source}/>
                <View style={{width: '100%', height:'100%', position:'absolute'}}>
                    {dimensions && 
                    <Svg
                        height={height}
                        width={width}
                    >
                    {lines.map(this.renderLine)}
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


