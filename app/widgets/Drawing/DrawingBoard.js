import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, PanResponder, StyleSheet, Image } from 'react-native';
import Svg, { Polyline, Rect } from 'react-native-svg';
import ReactDOMServer from 'react-dom/server';

const SENSITIVITY = 30; // Milliseconds between line points (lower is more sensitive)

const styles = StyleSheet.create({
  picture: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
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
    this.state = {
      lines: [],
    };
    this.allowed = false;
    this.startX = 0;
    this.startY = 0;
    this.lastX = 0;
    this.lastY = 0;
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => {
        this.props.onPress();
        return true;
      },
      onPanResponderGrant: this.addLine,
      onPanResponderMove: this.addPoint,
      onPanResponderRelease: () => {
        this.props.onRelease();
        const result = this.save();
        const svgString = this.serialize();
        // if (this.svgRef) {
        //   this.svgRef.toDataURL((base64) => {
        //     this.props.onResult({ ...result, base64 });
        //   });
        // } else {
        //
        // }
        this.props.onResult({ ...result, svgString });
      },
    });
    this.allowed = true;
  }

  addLine = (evt) => {
    const { lines, startTime } = this.state;
    if (!this.allowed) return;
    const timestamp = Date.now();
    const { locationX, locationY } = evt.nativeEvent;
    if (!startTime) {
      this.setState({ startTime: timestamp });
    }
    this.lastPressTimestamp = timestamp;
    this.startX = locationX;
    this.startY = locationY;
    const newLine = { points: [{ x: locationX, y: locationY, time: 0 }] };
    this.setState({ lines: [...lines, newLine] });
  }

  addPoint = (evt, gestureState) => {
    const { lines, startTime } = this.state;
    if (!this.allowed || lines.length === 0) return;
    const nowTimestamp = Date.now();
    const timeElapsed = nowTimestamp - startTime;
    const timeDelta = nowTimestamp - this.lastPressTimestamp;
    console.log('-----timeDelta------');
    console.log(timeDelta);
    const n = lines.length - 1;
    const { moveX, moveY, x0, y0 } = gestureState;
    const x = moveX - x0 + this.startX;
    const y = moveY - y0 + this.startY;
    if (timeDelta >= SENSITIVITY) {
      this.lastX = x;
      this.lastY = y;
      this.lastPressTimestamp = nowTimestamp;
      lines[n].points.push({ x: this.lastX, y: this.lastY, timeElapsed });
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

  reset = () => {
    this.setState({ lines: [], startTime: undefined });
  }

  start = () => {
    this.reset();
    this.allowed = true;
  }

  stop = () => {
    this.allowed = false;
  }

  save = () => {
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

  childToWeb = (child) => {
    const { type, props } = child;
    const name = type && (type.displayName || type.name);
    const Tag = name && name[0].toLowerCase() + name.slice(1);
    return <Tag {...props}>{this.toWeb(props.children)}</Tag>;
  };

  toWeb = children => React.Children.map(children, this.childToWeb);

  serialize = () => {
    const element = this.renderSvg();
    const webJsx = this.toWeb(element);
    return ReactDOMServer.renderToStaticMarkup(webJsx);
  };

  renderSvg() {
    const { lines, dimensions } = this.state;
    const width = dimensions ? dimensions.width : 300;
    const strArray = chunkedPointStr(lines, 50);
    return (
      <Svg
        ref={(ref) => { this.svgRef = ref; }}
        height={width}
        width={width}
      >
        {strArray.map(this.renderLine)}
      </Svg>
    );
  }

  render() {
    const { dimensions } = this.state;
    const width = dimensions ? dimensions.width : 300;
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
          <Image
            style={styles.picture}
            source={{ uri: this.props.imageSource }}
          />
        )}
        <View style={styles.blank}>
          {dimensions && this.renderSvg()}
        </View>
      </View>
    );
  }
}

DrawingBoard.defaultProps = {
  imageSource: null,
  lines: [],
  onResult: () => {},
  onPress: () => {},
  onRelease: () => {},
};

DrawingBoard.propTypes = {
  imageSource: PropTypes.string,
  lines: PropTypes.array,
  onResult: PropTypes.func,
  onPress: PropTypes.func,
  onRelease: PropTypes.func,
};
