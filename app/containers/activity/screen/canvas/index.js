import React, { Component } from 'react'
import { Text, View } from 'react-native'
import CanvasDrawingInput from './CanvasDrawingInput';
import CameraInput from './CameraInput';


export default class DrawingSection extends Component {
  resetData() {
    if(this.drawingRef)
      this.drawingRef.resetData();
  }

  takeAction() {
    if (this.cameraRef)
      this.cameraRef.take();
  }
  render() {
    const {type, config={}, answer, onChange, onNextChange} = this.props;
    console.log(config);
    switch(type) {
      case 'draw':
        return (
          <CanvasDrawingInput
            config={config}
            answer={answer}
            onChange={onChange}
            onNextChange={onNextChange}
            ref={ref => {this.drawingRef = ref}}
          />)
      case 'camera':
        return (
          <CameraInput
            config={config}
            answer={answer}
            onChange={onChange}
            onNextChange={onNextChange}
            ref={ref => {this.cameraRef = ref}}
            />
        );
      default:
        return (<View></View>);
    }
      
    
  }
}