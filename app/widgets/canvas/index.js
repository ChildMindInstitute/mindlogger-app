import React, { Component } from 'react';
import { /* Text, */ View } from 'react-native';
import PropTypes from 'prop-types';
import CanvasDrawingInput from './CanvasDrawingInput';
import CameraInput from './CameraInput';


export default class DrawingSection extends Component {
  resetData() {
    if (this.drawingRef) this.drawingRef.resetData();
  }

  takeAction() {
    if (this.cameraRef) this.cameraRef.take();
    if (this.drawingRef) this.drawingRef.take();
  }

  render() {
    const {
      type,
      video,
      config,
      answer,
      onChange,
      onNextChange,
    } = this.props;
    console.log(config);
    switch (type) {
      case 'draw':
        return (
          <CanvasDrawingInput
            config={config}
            answer={answer}
            onChange={onChange}
            onNextChange={onNextChange}
            ref={
              (ref) => {
                this.drawingRef = ref;
              }
            }
          />
        );
      case 'camera':
        return (
          <CameraInput
            video={video}
            config={config}
            answer={answer}
            onChange={onChange}
            onNextChange={onNextChange}
            ref={(ref) => { this.cameraRef = ref; }}
          />
        );
      default:
        return (<View />);
    }
  }
}

DrawingSection.propTypes = {
  answer: PropTypes.object.isRequired,
  config: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  onNextChange: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  video: PropTypes.object.isRequired,
};

DrawingSection.defaultProps = {
  config: {},
};
