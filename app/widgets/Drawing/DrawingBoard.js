import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Image } from 'react-native';
import Svg, { Polyline, Rect } from 'react-native-svg';
import ReactDOMServer from 'react-dom/server';
import { SketchCanvas } from '@terrylinla/react-native-sketch-canvas';
import { sendData } from "../../services/socket";

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

function chunkedPointStr(lines, chunkSize, scale) {
  const results = [];
  lines.forEach((line) => {
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
    for (let index = 0; index < length; index += chunkSize) {
      const myChunk = line.points.slice(index, index + chunkSize + 1);
      // Do something if you want with the group
      results.push(myChunk.map(point => `${point.x*scale},${point.y*scale}`).join(' '));
    }
  });
  return results;
}

export default class DrawingBoard extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };

    this.lines = [...this.props.lines];

    const lineCount = this.lines.length;

    if (lineCount) {
      this.lines[lineCount-1] = {
        ...this.lines[lineCount-1],
        points: [...this.lines[lineCount-1].points]
      }
    }

    this.canvas = null;
    this.started = false;
  }

  addLine = (x, y) => {
    const { width } = this.state.dimensions;

    const newLine = { points: [{ x, y, time: Date.now() }], startTime: Date.now() };
    this.lines.push(newLine);

    sendData('live_event', { x: x / width * 100, y: y / width * 100, time: Date.now() }, this.props.appletId);
  }

  addPoint = (x, y) => {
    const { width } = this.state.dimensions;

    if (this.lines.length === 0) return;
    const time = Date.now();
    const n = this.lines.length - 1;

    this.lines[n].points.push({ x, y, time });

    sendData('live_event', { x: x / width * 100, y: y / width * 100, time }, this.props.appletId);
  }

  onLayout = (event) => {
    if (this.state.dimensions) return; // layout was already called
    const { width, height, top, left } = event.nativeEvent.layout;
    this.setState({ dimensions: { width, height, top, left }});

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];

      const path = {
        size: { width: width, height: width },
        path: {
          color: 'black',
          width: 1.5,
          id: i+1,
          data: line.points.map(point => `${point.x},${point.y}`)
        }
      }

      this.canvas.addPath(path)
    }
  }

  reset = () => {
    this.canvas.clear();
    this.lines = [];
    this.started = false;
  }

  save = () => {
    const { width } = this.state.dimensions;
    const results = this.lines.map(line => ({
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
    const { dimensions } = this.state;
    const width = dimensions ? dimensions.width : 300;
    const strArray = chunkedPointStr(this.lines, 50, 100 / width);

    return (
      <Svg
        height={100}
        width={100}
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
      >
        {this.props.imageSource && (
          <Image
            style={styles.picture}
            source={{ uri: this.props.imageSource }}
          />
        )}

        <SketchCanvas
          ref={(ref) => {
            this.canvas = ref;
          }}
          style={styles.blank}
          strokeColor={'black'}
          strokeWidth={1.5}
          onStrokeStart={(x, y) => {
            this.addLine(x, y);

            if (!this.started) {
              this.started = true;
              this.props.onPress();
            }
          }}
          onStrokeChanged={(x, y) => {
            this.addPoint(x, y);
          }}
          onStrokeEnd={() => {
            this.props.onRelease();
            const result = this.save();
            const svgString = this.serialize();

            this.props.onResult({ ...result, lines: this.lines, svgString, width });
          }}
        />
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
