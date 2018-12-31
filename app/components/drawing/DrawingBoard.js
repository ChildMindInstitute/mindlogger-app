import React, {Component} from 'react';
import {View, PanResponder, Image, StyleSheet} from 'react-native';
import {Icon} from 'native-base';

import Svg,{
    Polyline,
} from 'react-native-svg';

import GImage from '../image/Image';

const styles = StyleSheet.create({
    picture: {width: '100%', height:'100%', resizeMode: 'cover'}
})

function chunckedPointStr(lines, chunkSize){
    var results = [];
    lines.forEach(line => {
        let length = line.points.length
        for (var index = 0; index < length ; index += chunkSize) {
            myChunk = line.points.slice(index, index+chunkSize+1);
            // Do something if you want with the group
            results.push(myChunk.map(point => point.x + "," + point.y).join(" "));
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
        const {lines, startTime} = this.state
        if(!this.allowed) return

        const {locationX, locationY} = evt.nativeEvent
        if(!startTime)
            this.setState({startTime: (new Date()).getTime()})
        this.startX = locationX
        this.startY = locationY
        lines.push({points:[{x:locationX, y:locationY, time:0}]})
        this.setState({lines})
    }

    addPoint = (evt, gestureState) => {
        const {lines, dimensions, startTime} = this.state
        let time = Date.now() - startTime;
        if(!this.allowed) return
        let n = lines.length-1
        const {moveX, moveY, x0, y0} = gestureState
        const x = moveX-x0+this.startX
        const y = moveY-y0+this.startY
        if((Math.abs(this.lastX-x)>10) || (Math.abs(this.lastY-y)>10)) {
            this.lastX = x
            this.lastY = y
            lines[n].points.push({ x: this.lastX, y:this.lastY, time})
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
              this.props.onResult(this.save());
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
        this.setState({lines: []})
        if (this.props.autoStart) {
            this.allowed = true
        }
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
        
    }
    reset(){
        this.setState({lines:[], startTime:undefined})
    }
    start() {
        this.reset()
        this.allowed = true
    }

    stop() {
        this.allowed = false
    }

    save() {
        const {lines, startTime} = this.state
        const { width } = this.state.dimensions
        results = lines.map(line => ({
            ...line,
            points: line.points.map( point => ({
                ...point,
                x: point.x/width*100,
                y: point.y/width*100
                }))
            })
        )
        return {lines: results, startTime}
    }

    render() {
        const {lines, dimensions} = this.state
        const {placeholder} = this.props
        if (dimensions) {
            var { width } = dimensions
        }
        if(!width)
            width = 300
        const strArray = chunckedPointStr(lines,50)
        return (
            
            <View style={{width: '100%', height: width || 300, alignItems: 'center', backgroundColor: 'white'}} onLayout={this.onLayout} {...this._panResponder.panHandlers}>
                
                {this.props.source && (<Image style={styles.picture} source={this.props.source}/>)}
                {this.props.sourceFiles && (<GImage style={styles.picture} file={this.props.sourceFiles}/>)}
                {placeholder && (<Icon name="brush" style={{fontSize:120}}/>)}
                <View style={{width: '100%', height:'100%', position:'absolute'}}>
                    {dimensions && 
                    <Svg
                        height={width}
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
        let {width, height, top, left} = event.nativeEvent.layout;
        if (this.props.lines && this.props.lines.length > this.state.lines.length) {
            let lines = this.props.lines.map(line => ({
                ...line,
                points: line.points.map( point => ({
                    ...point,
                    x: point.x*width/100,
                    y: point.y*width/100
                    }))
                })
            );
            this.setState({dimensions: {width, height, top, left}, lines});
        } else {
            this.setState({dimensions: {width, height, top, left}});
        }
    }
}

{/* <DrawingBoard source={drawing.image_url && {uri: drawing.image_url}} disabled={!started} ref={board => this.board = board}/> */}
