import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, PanResponder, StyleSheet, Image } from 'react-native';
import Svg, { Polyline, Rect } from 'react-native-svg';
import ReactDOMServer from 'react-dom/server';
import { sendData } from "../../services/socket";
import Canvas from 'react-native-canvas';

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
    const points = [...line.points];
    let { length } = points;

    if (length === 1) {
      const point = points[0];

      points.push({
        ...point,
        x: point.x + 1.5,
        y: point.y + 1.5,
      });
      length += 1;
    }

    for (let index = 0; index < length; index += chunkSize) {
      const myChunk = points.slice(index, index + chunkSize + 1);
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
    this.startX = 0;
    this.startY = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.canvasContext = null;
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => {
        this.props.onPress();
        return true;
      },
      onPanResponderGrant: this.addLine,
      onPanResponderMove: (evt, gestureState) => {
        this.addPoint(gestureState);
      },
      onPanResponderRelease: (evt, gestureState) => {
        this.addPoint(gestureState, true);
        this.props.onRelease();
        const result = this.save();
        const svgString = this.serialize();

        let line = {};

        if (result && result.lines) {
          const lines = result.lines.length;
          line = { ...result.lines[lines - 1], endTime: Date.now() };
          result.lines[lines - 1] = line;
        }

        this.props.onResult({ ...result, lines: [...this.props.lines, line], svgString });
      },
    });
  }

  addLine = (evt) => {
    const { lines } = this.state;
    const { width } = this.state.dimensions;

    const { locationX, locationY } = evt.nativeEvent;

    if (lines.length) {
      const { points } = lines[lines.length - 1];
      if (points.length == 1) {
        this.drawLine(points[0].x, points[0].y, points[0].x + 1.5, points[0].y + 1.5);
      }
    }

    this.startX = locationX;
    this.startY = locationY;
    this.lastX = this.lastY = 0;
    const newLine = { points: [{ x: locationX, y: locationY, time: Date.now() }], startTime: Date.now() };
    this.setState({ lines: [...lines, newLine] });

    sendData('live_event', { x: locationX / width * 100, y: locationY / width * 100, time: Date.now() }, this.props.appletId);
  }

  drawLine = (x1, y1, x2, y2) => {
    this.canvasContext.beginPath();
    this.canvasContext.moveTo(x1, y1)
    this.canvasContext.lineTo(x2, y2);
    this.canvasContext.closePath();
    this.canvasContext.stroke();
  }

  addPoint = (gestureState, lastPoint = false) => {
    const { lines } = this.state;
    const { width } = this.state.dimensions;

    if (lines.length === 0) return;
    const time = Date.now();
    const n = lines.length - 1;
    const { moveX, moveY, x0, y0 } = gestureState;

    if (moveX === 0 && moveY === 0) {
      if (lines[n].points.length == 1) {
        const point = lines[n].points[0];

        this.drawLine(point.x, point.y, point.x + 1.5, point.y + 1.5);
      }
      return;
    }
    else {
      if (this.lastX && this.lastY) {
        this.drawLine(this.lastX, this.lastY, moveX - x0 + this.startX, moveY - y0 + this.startY)
      }

      this.lastX = moveX - x0 + this.startX;
      this.lastY = moveY - y0 + this.startY;

      if (this.lastX === this.startX && this.lastY === this.startY) return;
    }

    this.lastPressTimestamp = time;
    lines[n].points.push({ x: this.lastX, y: this.lastY, time });
    this.setState({ lines });

    sendData('live_event', { x: this.lastX / width * 100, y: this.lastY / width * 100, time }, this.props.appletId);
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
    this.setState({ lines: [] });
  }

  save = () => {
    const { lines } = this.state;
    const { width } = this.state.dimensions;
    const results = lines.map(line => ({
      ...line,
      points: line.points.map(point => ({
        ...point,
        x: point.x / width * 100,
        y: point.y / width * 100,
      })),
    }));
    return { lines: results };
  }

  renderLine = (pointStr, idx) => (
    <Polyline
      key={idx}
      points={pointStr}
      fill="none"
      stroke="black"
      strokeWidth="2"
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

  initCanvas = (canvas) => {
    if (!canvas) return ;

    const { dimensions, lines } = this.state;
    const width = dimensions ? dimensions.width : 300;

    canvas.width = width;
    canvas.height = width;

    this.canvasContext = canvas.getContext('2d');
    this.canvasContext.lineWidth = 1.5;

    for (const line of lines) {
      this.canvasContext.beginPath();

      const { points } = line;
      let { length } = points;

      if (length === 1) {
        const point = points[0];

        points.push({
          ...point,
          x: point.x + 1.5,
          y: point.y + 1.5,
        });
        length += 1;
      }

      this.canvasContext.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        this.canvasContext.lineTo(points[i].x, points[i].y);
      }

      this.canvasContext.closePath();
      this.canvasContext.stroke();
    }
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
          {
            dimensions && <Canvas ref={this.initCanvas} /> || <></>
          }
        </View>
      </View>
    );
  }
}

DrawingBoard.defaultProps = {
  imageSource: null,
  lines: [],
  onResult: () => { },
  onPress: () => { },
  onRelease: () => { },
};

DrawingBoard.propTypes = {
  imageSource: PropTypes.string,
  appletId: PropTypes.string,
  lines: PropTypes.array,
  onResult: PropTypes.func,
  onPress: PropTypes.func,
  onRelease: PropTypes.func,
};
