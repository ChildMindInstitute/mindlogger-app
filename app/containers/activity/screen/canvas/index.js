import React, { Component } from 'react'
import { Text, View } from 'react-native'
import CanvasDrawingInput from './CanvasDrawingInput';


export default class DrawingSection extends Component {
  resetData() {
    if(this.drawingRef)
      this.drawingRef.resetData();
  }
  render() {
    const {type, config={}, answer, onChange, onNextChange} = this.props;
    console.log(config);
    if (type == 'draw')
      return (
        <CanvasDrawingInput
          config={config}
          answer={answer}
          onChange={onChange}
          onNextChange={onNextChange}
          ref={ref => {this.drawingRef = ref}}
        />);
    else
      return (<View></View>);
  }
}