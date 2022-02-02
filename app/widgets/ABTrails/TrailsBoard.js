import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, PanResponder, StyleSheet, Image } from 'react-native';
import Svg, { Polyline, Circle, Text } from 'react-native-svg';
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

export default class TrailsBoard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lines: [],
      failedCnt: 0,
      screenTime: 0,
      errorPoint: null,
      currentPoint: -1,
      currentIndex: 1,
      validIndex: -1,
      startTime: 0,
      currentScreen: 0,
      isStarted: false,
      isStopped: false,
      isValid: false,
      rate: 1,
    };
    this.canvasContext=null;
    this.allowed = false;
    this.timeInterval = 0;
    this.startX = 0;
    this.startY = 0;
    this.lastX = 0;
    this.lastY = 0;
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => {
        this.props.onPress();
        return true;
      },
      onPanResponderGrant: this.startLine,
      onPanResponderMove: this.movePoint,
      onPanResponderRelease: (evt, gestureState) => {
        const { lines, currentIndex } = this.state;
        this.endLine(evt, gestureState);
        this.props.onResult({ ...this.save(lines, currentIndex), startTime: this.state.startTime });
      },
    });
    this.allowed = true;
  }

  componentDidMount() {
    const {
      currentIndex,
      failedCnt,
      currentScreen,
      trailsTimerId,
      setTrailsTimerId,
    } = this.props;
    let { screenTime } = this.props;

    if (trailsTimerId && currentScreen) {
      clearInterval(trailsTimerId);
    }

    this.setState({ startTime: new Date().getTime() });

    this.timeInterval = setInterval(() => {
      const { currentIndex, failedCnt, currentScreen } = this.props;
      const { lines } = this.state;
      const result = this.save(lines, currentIndex);

      screenTime = screenTime ? screenTime + 1 : 1;
      if ((currentScreen === 2 && screenTime >= 150) ||
        (currentScreen === 4 && screenTime >= 300)) {
        this.setState({ screenTime: 0 });
        this.props.onResult({ ...result, screenTime, failedCnt: failedCnt, startTime: this.state.startTime }, true);
      } else {
        this.props.onResult({ ...result, screenTime, failedCnt: failedCnt, startTime: this.state.startTime });
        this.setState({ screenTime });
      }
    }, 1000)
    setTrailsTimerId(this.timeInterval)
    this.setState({ failedCnt: failedCnt ? failedCnt : 0 });
    this.setState({ currentIndex, currentScreen });
  }

  componentWillUnmount() {
    const { setTrailsTimerId } = this.props;

    if (this.timeInterval) {
      setTrailsTimerId(null);
      clearInterval(this.timeInterval);
    }
  }

  drawLines = (points, color=null) => {
    let started = false, originalColor = null;

    if (color) {
      originalColor = this.canvasContext.strokeStyle;
      this.canvasContext.strokeStyle = color;
      this.canvasContext.lineWidth = 2.5;
    }

    this.canvasContext.beginPath();

    for (let i = 0; i < points.length; i++) {
      if (!started) {
        this.canvasContext.moveTo(points[i].x, points[i].y);
        started = true;
      } else {
        this.canvasContext.lineTo(points[i].x, points[i].y);
      }
    }

    this.canvasContext.stroke();

    if (originalColor) {
      this.canvasContext.lineWidth = 1;
      this.canvasContext.strokeStyle = originalColor;
    }
  }

  startLine = (evt) => {
    const { screen } = this.props;
    const { lines, rate, currentIndex, currentPoint, isStarted, dimensions } = this.state;
    const width = dimensions ? dimensions.width : 300;

    if (!this.allowed) return;

    const { locationX, locationY } = evt.nativeEvent;
    let isValid = false;
    let order = 0;

    const currentItem = screen.items.find(({ order }) => order === currentIndex);
    const nextItem = screen.items.find(({ order }) => order === currentIndex + 1);

    if (!isStarted) this.setState({ isStarted: true });

    if (currentPoint !== -1) {
      this.setState({ currentPoint: -1 });
    }

    this.props.onError();
    screen.items.forEach((item) => {
      const distance = Math.sqrt(Math.pow(item.cx * rate - locationX, 2) + Math.pow(item.cy * rate - locationY, 2));

      if (distance <= screen.r * rate) {
        this.startX = item.cx * rate;
        this.startY = item.cy * rate;

        if (currentIndex === item.order) {
          isValid = true;
        } else {
          isValid = false;
          this.props.onError("Incorrect start point!", true);
          return;
        }
      }
    });

    this.setState({ isValid, validIndex: -1, isStopped: true });
    if (isValid && currentItem.order !== screen.items.length) {
      const newLine = { points: [{ x: this.startX, y: this.startY, time: Date.now(), valid: true, start: currentItem.label, end: nextItem.label }] };
      this.setState({ lines: [...lines, newLine] });
      this.logData(this.startX, this.startY);
    }
    this.lastX = this.lastY = 0;
  }

  logData = (x, y) => {
    const { width } = this.state.dimensions;
    sendData('live_event', {
      x: x * width / 100,
      y: y * width / 100,
      time: Date.now()
    }, this.props.appletId);
  }

  endLine = (evt, gestureState) => {
    const { screen } = this.props;
    const { lines, rate, currentIndex, isStopped, dimensions } = this.state;
    const n = lines.length - 1;
    let isValidLine = false;

    if (!isStopped || !lines.length) return;

    let item = null;
    lines[n].points.forEach((point) => {
      const { x, y } = point;
      item = screen.items.find(({ cx, cy }) =>
        Math.sqrt(Math.pow(cx * rate - x, 2) + Math.pow(cy * rate - y, 2)) < screen.r * rate
      );

      if (item && item.order !== currentIndex) isValidLine = true;
    });

    if (!isValidLine && lines.length) {
      lines[n].points.forEach((point) => {
        point.valid = false;
        point.actual = item && item.label || 'none';
      })

      this.drawLines(lines[n].points, 'white');
      this.initCanvas();
    }
  }

  movePoint = (evt, gestureState) => {
    const { screen, onRelease, currentScreen } = this.props;
    const { lines, isValid, rate, errorPoint, dimensions } = this.state;
    let { currentIndex } = this.state;
    let isFinished = false;

    if (!this.allowed || !lines.length || !isValid || errorPoint !== null) return;

    const currentItem = screen.items.find(({ order }) => order === currentIndex);
    const nextItem = screen.items.find(({ order }) => order === currentIndex + 1);

    if (!nextItem) return;

    const time = Date.now();
    const n = lines.length - 1;
    let valid = true;
    const { moveX, moveY, x0, y0 } = gestureState;

    if (this.lastX && this.lastY) {
      this.drawLines([
        { x: this.lastX, y: this.lastY },
        { x: moveX - x0 + this.startX, y: moveY - y0 + this.startY }
      ]);
    }

    this.lastX = moveX - x0 + this.startX;
    this.lastY = moveY - y0 + this.startY;
    this.lastPressTimestamp = time;

    const item = screen.items.find(({ cx, cy }) =>
      Math.sqrt(Math.pow(cx * rate - this.lastX, 2) + Math.pow(cy * rate - this.lastY, 2)) < screen.r * rate
    );

    if (item && item.order !== currentIndex) {
      if (item.order === currentIndex + 1) {
        currentIndex += 1;

        if (currentIndex === screen.items.length) {
          isFinished = true;
        }
        this.setState({ validIndex: lines[n].points.length });
      } else {
        valid = false;
      }
      this.setState({ isStopped: false });
    }

    if (!valid) {
      const { validIndex } = this.state;
      const currentPos = {
        x: (currentItem.cx + item.cx) / 2,
        y: (currentItem.cy + item.cy) / 2,
      }
      let position = lines[n].points[0];

      lines[n].points.forEach((point) => {
        const d1 = Math.pow(currentPos.x * rate - point.x, 2) + Math.pow(currentPos.y * rate - point.y, 2);
        const d2 = Math.pow(currentPos.x * rate - position.x, 2) + Math.pow(currentPos.y * rate - position.y, 2);

        if (d1 < d2) {
          position = point;
        }
      });

      this.props.onError("Incorrect line!", true);
      this.setState({ lines, isValid: false, currentPoint: currentIndex, errorPoint: position });
      setTimeout(() => {
        lines[n].points.forEach((point, index) => {
          if (index > validIndex) {
            point.valid = false;
            point.actual = item.label;
          }
        })

        this.drawLines(lines[n].points.slice(Math.max(validIndex, 0)), 'white');
        this.initCanvas();
        this.setState({ lines, errorPoint: null, currentPoint: -1 });
      }, 2000);

    } else {
      lines[n].points.push({ x: this.lastX, y: this.lastY, time, valid, start: currentItem.label, end: nextItem.label });
      this.setState({ lines: [...lines], currentIndex });
    }
    if (isFinished) {
      onRelease(currentScreen === 4
        ? 'Finished. Click Done to complete.'
        : 'Finished. Click next to continue.');
    }

    this.logData(this.lastX, this.lastY);
  }

  onLayout = (event) => {
    if (this.state.dimensions) return; // layout was already called
    const { width, height, top, left } = event.nativeEvent.layout;

    if (this.props.lines && this.props.lines.length > this.state.lines.length) {
      const lines = this.props.lines.length ? this.props.lines.map(line => ({
        ...line,
        points: line.points.map(point => ({
          ...point,
          x: point.x * width / 100,
          y: point.y * width / 100,
        })),
      })) : [];
      this.setState({ rate: width / 100, dimensions: { width, height, top, left }, lines });
    } else {
      this.setState({ rate: width / 100, dimensions: { width, height, top, left } });
    }
  }

  reset = () => {
    this.setState({ lines: [] });
    this.canvasContext.clearRect(0, 0, width, width)
  }

  start = () => {
    this.reset();
    this.allowed = true;
  }

  stop = () => {
    this.allowed = false;
  }

  save = (lines, currentIndex) => {
    const { width } = this.state.dimensions;
    const results = lines.map(line => ({
      ...line,
      points: line.points.map(point => ({
        ...point,
        x: point.x / width * 100,
        y: point.y / width * 100,
      })),
    }));

    return { lines: results, currentIndex };
  }

  renderTrailsData = (item, index, trailsData) => {
    const { screen } = this.props;
    const { currentPoint, rate, errorPoint, isStarted } = this.state;
    let itemColor = trailsData.colors.pending;

    if ((index === 0 && !isStarted) || index === currentPoint - 1) {
      itemColor = trailsData.colors.passed;
    }

    return (
      <>
        <Circle
          fill={itemColor}
          stroke={itemColor}
          strokeWidth="1.2"
          cx={item.cx * rate}
          cy={item.cy * rate}
          r={trailsData.r * rate}
        />

        <Text
          stroke="white"
          fontSize={trailsData.fontSize * rate}
          fill="white"
          x={item.cx * rate}
          y={(item.cy + trailsData.fontSize / 2) * rate}
          textAnchor="middle"
        >
          {item.label}
        </Text>

        {errorPoint && <Text
          stroke={trailsData.colors.failed}
          fontSize={trailsData.fontSize * rate * 0.75}
          fontWeight="200"
          x={errorPoint.x}
          y={errorPoint.y}
          textAnchor="middle"
        >
          {`X`}
        </Text>}

        {index === 0 && <Text
          stroke={trailsData.colors.pending}
          fontSize={trailsData.fontSize * rate * 0.75}
          fontWeight="200"
          x={item.cx * rate}
          y={(item.cy - trailsData.r - 2) * rate}
          textAnchor="middle"
        >
          {`Begin`}
        </Text>}

        {index === screen.items.length - 1 && <Text
          fill="white"
          stroke={trailsData.colors.pending}
          fontSize={trailsData.fontSize * rate * 0.75}
          fontWeight="200"
          x={item.cx * rate}
          y={(item.cy - trailsData.r - 2) * rate}
          textAnchor="middle"
        >
          {`End`}
        </Text>}
      </>
    )
  }

  renderSvg() {
    const { dimensions } = this.state;
    const { screen } = this.props;
    const width = dimensions ? dimensions.width : 300;

    return (
      <Svg
        ref={(ref) => { this.svgRef = ref; }}
        height={width}
        width={width}
      >
        {screen.items.map((item, index) => this.renderTrailsData(item, index, screen))}
      </Svg>
    );
  }

  initCanvas = (canvas = null) => {
    if (!canvas && !this.canvasContext) return ;

    const { dimensions, lines } = this.state;
    const width = dimensions ? dimensions.width : 300;

    if (canvas) {
      canvas.width = width;
      canvas.height = width;

      this.canvasContext = canvas.getContext('2d');
    }

    this.canvasContext.lineWidth = 1;

    for (const line of lines) {
      this.canvasContext.beginPath();

      let started = false;

      for (let i = 0; i < line.points.length; i++) {
        const point = line.points[i];

        if (!point.valid) continue;

        if (!started) {
          this.canvasContext.moveTo(point.x, point.y);
          started = true;
        } else {
          this.canvasContext.lineTo(point.x, point.y);
        }
      }

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
          height: width,
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
          {dimensions && <Canvas ref={this.initCanvas} /> || <></>}
        </View>

        <View style={styles.blank}>
          {dimensions && this.renderSvg()}
        </View>
      </View>
    );
  }
}

TrailsBoard.defaultProps = {
  imageSource: null,
  lines: [],
  currentIndex: 1,
  onResult: () => { },
  onPress: () => { },
  onRelease: () => { },
};

TrailsBoard.propTypes = {
  imageSource: PropTypes.string,
  lines: PropTypes.array,
  screen: PropTypes.object,
  currentIndex: PropTypes.number,
  currentScreen: PropTypes.number,
  onResult: PropTypes.func,
  setTrailsTimerId: PropTypes.func,
  trailsTimerId: PropTypes.number,
  onPress: PropTypes.func,
  onError: PropTypes.func,
  onRelease: PropTypes.func,
  appletId: PropTypes.string,
};
