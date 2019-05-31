import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, PanResponder, StyleSheet } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { GImage } from '../../components/core';

const styles = StyleSheet.create({
  picture: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  blank: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#d6d7da',
  },
});

function chunkedPointStr(lines, chunkSize) {
  const results = [];
  lines.forEach((line) => {
    const { length } = line.points;
    for (let index = 0; index < length; index += chunkSize) {
      const myChunk = line.points.slice(index, index + chunkSize + 1);
      // Do something if you want with the group
      results.push(myChunk.map(point => `${point.x},${point.y}`).join(' '));
    }
  });
  return results;
}

export default class DrawingBoard extends Component {
  constructor(props) {
    super(props);
    this.allowed = false;
    this.startX = 0;
    this.startY = 0;
    this.lastX = 0;
    this.lastY = 0;
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: this.addLine,
      onPanResponderMove: this.addPoint,
      onPanResponderTerminationRequest: () => true,
      onPanResponderRelease: () => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
        this.props.onResult(this.save());
      },
      onPanResponderTerminate: () => {
        // Another component has become the responder, so this gesture
        // should be cancelled
      },
      // Returns whether this component should block native components from becoming the JS
      // responder. Returns true by default. Is currently only supported on android.
      onShouldBlockNativeResponder: () => true,
    });
    this.setState({ lines: [] });
    this.allowed = true;
  }

  addLine = (evt) => {
    const { lines, startTime } = this.state;
    if (!this.allowed) return;

    const { locationX, locationY } = evt.nativeEvent;
    if (!startTime) {
      this.setState({ startTime: (new Date()).getTime() });
    }
    this.startX = locationX;
    this.startY = locationY;
    lines.push({ points: [{ x: locationX, y: locationY, time: 0 }] });
    this.setState({ lines });
  }

  addPoint = (evt, gestureState) => {
    const { lines, startTime } = this.state;
    const time = Date.now() - startTime;
    if (!this.allowed) return;
    const n = lines.length - 1;
    const { moveX, moveY, x0, y0 } = gestureState;
    const x = moveX - x0 + this.startX;
    const y = moveY - y0 + this.startY;
    if ((Math.abs(this.lastX - x) > 10) || (Math.abs(this.lastY - y) > 10)) {
      this.lastX = x;
      this.lastY = y;
      lines[n].points.push({ x: this.lastX, y: this.lastY, time });
      this.setState({ lines });
    }
  }

  onLayout = (event) => {
    if (this.state.dimensions) return; // layout was already called
    const { width, height, top, left } = event.nativeEvent.layout;
    if (this.props.lines && this.props.lines.length > this.state.lines.length) {
      const lines = this.props.lines.map(line => ({
        ...line,
        points: line.points.map(point => ({
          ...point,
          x: point.x * width / 100,
          y: point.y * width / 100,
        })),
      }));
      this.setState({ dimensions: { width, height, top, left }, lines });
    } else {
      this.setState({ dimensions: { width, height, top, left } });
    }
  }

  reset() {
    this.setState({ lines: [], startTime: undefined });
  }

  start() {
    this.reset();
    this.allowed = true;
  }

  stop() {
    this.allowed = false;
  }

  save() {
    const { lines, startTime } = this.state;
    const { width } = this.state.dimensions;
    const results = lines.map(line => ({
      ...line,
      points: line.points.map(point => ({
        ...point,
        x: point.x / width * 100,
        y: point.y / width * 100,
      })),
    }));
    return { lines: results, startTime };
  }

  renderLine = (pointStr, idx) => (
    <Polyline
      key={idx}
      points={pointStr}
      fill="none"
      stroke="black"
      strokeWidth="3"
    />
  );

  render() {
    const { lines, dimensions } = this.state;
    const width = dimensions ? dimensions.width : 300;
    const strArray = chunkedPointStr(lines, 50);

    return (
      <View
        style={{
          width: '100%',
          height: width || 300,
          alignItems: 'center',
          backgroundColor: 'white',
        }}
        onLayout={this.onLayout}
        {...this._panResponder.panHandlers}
      >
        {this.props.imageSource && (
          <GImage
            style={styles.picture}
            file={this.props.imageSource}
          />
        )}
        <View style={styles.blank}>
          {dimensions && (
            <Svg
              height={width}
              width={width}
            >
              {strArray.map(this.renderLine)}
            </Svg>
          )}
        </View>
      </View>
    );
  }
}

DrawingBoard.defaultProps = {
  imageSource: null,
  lines: [],
  onResult: () => {},
};

DrawingBoard.propTypes = {
  imageSource: PropTypes.string,
  lines: PropTypes.array,
  onResult: PropTypes.func,
};
