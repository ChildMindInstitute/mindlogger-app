import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, PanResponder, StyleSheet, Image } from 'react-native';
import Svg, { Polyline, Circle, Text } from 'react-native-svg';
import { SketchCanvas } from '@m4yer/react-native-sketch-canvas';
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
    this.allowed = false;
    this.timeInterval = 0;
    this.startX = 0;
    this.startY = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.capturing = false;

    this.pathStack = [];
    this.pathId = 1;
    this.lastIndex = -1;
    this.canvas = null;
    this.lastPathId = 0;

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

        this.props.onResult({ ...this.save(lines, currentIndex), startTime: this.state.startTime, updated: true });
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

        this.props.onResult({ ...result, screenTime, failedCnt: failedCnt, startTime: this.state.startTime, updated: this.capturing }, true);
      } else {
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

  startLine = (evt) => {
    const { screen } = this.props;
    const { lines, rate, currentIndex, currentPoint, isStarted } = this.state;
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

      if (distance <= screen.r * rate + 2) {
        this.startX = locationX;
        this.startY = locationY;

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
      this.capturing = true;
    }
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
    const { lines, rate, currentIndex, isStopped, validIndex } = this.state;
    const n = lines.length - 1;
    let isValidLine = false;

    this.capturing = false;

    if (!isStopped || !lines.length) return ;

    let item = null;
    lines[n].points.forEach((point) => {
      const { x, y } = point;
      item = screen.items.find(({ cx, cy }) =>
        Math.sqrt(Math.pow(cx * rate - x, 2) + Math.pow(cy * rate - y, 2)) < screen.r * rate
      );

      if (item && item.order == currentIndex+1) {
        isValidLine = true;
      }
    });

    if (!isValidLine && lines.length) {
      lines[n].points.forEach((point, index) => {
        if (index > validIndex) {
          point.valid = false;
          point.actual = item && item.label || 'none';
        }
      });

      // pop stack
      for (const pathId of this.pathStack) {
        this.canvas.deletePath(pathId);
      }
    }

    if (isValidLine && lines.length) {
      this.addPathToCanvas(lines[n].points.slice(this.lastIndex+1));
    }

    if (this.lastPathId) {
      this.canvas.deletePath(this.lastPathId);
      this.lastPathId = 0;
    }

    this.pathStack = [];
    this.lastIndex = -1;
  }

  movePoint = (evt, gestureState) => {
    const { screen, onRelease, currentScreen } = this.props;
    const { lines, isValid, rate, errorPoint } = this.state;
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

    this.lastX = moveX - x0 + this.startX;
    this.lastY = moveY - y0 + this.startY;
    this.lastPressTimestamp = time;

    const item = screen.items.find(({ cx, cy }) =>
      Math.sqrt(Math.pow(cx * rate - this.lastX, 2) + Math.pow(cy * rate - this.lastY, 2)) < screen.r * rate
    );

    let validIndex = this.state.validIndex;
    if (item && item.order !== currentIndex) {
      if (item.order === currentIndex + 1) {
        currentIndex += 1;

        if (currentIndex === screen.items.length) {
          isFinished = true;
        }
        validIndex = lines[n].points.length;
        this.setState({ validIndex });
      } else {
        valid = false;
      }

      this.setState({ isStopped: false });
    } else {
      this.setState({ isStopped: true });
    }

    if (!valid) {
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

      let stack = [...this.pathStack], lastId = this.lastPathId;
      this.pathStack = [];
      this.lastPathId = 0;
      this.lastIndex = -1;

      setTimeout(() => {
        lines[n].points.forEach((point, index) => {
          if (index > validIndex) {
            point.valid = false;
            point.actual = item.label;
          }
        })
        this.setState({ lines, errorPoint: null, currentPoint: -1 });

        // pop stack
        if (lastId) {
          this.canvas.deletePath(lastId);
        }

        for (const pathId of stack) {
          this.canvas.deletePath(pathId);
        }
      }, 2000);

    } else {
      lines[n].points.push({ x: this.lastX, y: this.lastY, time, valid, start: currentItem.label, end: nextItem.label });
      this.setState({ lines: [...lines], currentIndex });

      if (this.lastPathId) {
        this.canvas.deletePath(this.lastPathId);
        this.lastPathId = 0;
      }

      if (validIndex == lines[n].points.length-1) {
        this.addPathToCanvas(lines[n].points.slice(this.lastIndex+1));
        this.lastIndex = validIndex-2;
        this.pathStack = [];
      } else if (lines[n].points.length > this.lastIndex + 50) {
        this.pathStack.push(
          this.addPathToCanvas(lines[n].points.slice(this.lastIndex+1))
        );

        this.lastIndex = lines[n].points.length-2;
      } else {
        this.lastPathId = this.addPathToCanvas(lines[n].points.slice(this.lastIndex+1));
      }
    }
    if (isFinished) {
      onRelease(currentScreen === 4
        ? 'Finished. Click Done to complete.'
        : 'Finished. Click next to continue.');
    }

    this.logData(this.lastX, this.lastY);
  }

  addPathToCanvas (points) {
    let width = this.state.dimensions.width;

    if(points.length) {
      points.push(points[points.length-1]);
    }

    const path = {
      size: { width: width, height: width },
      path: {
        color: 'black',
        width: 1.5,
        id: this.pathId,
        data: points.map(point => `${point.x},${point.y}`)
      }
    }
    this.pathId++;

    if (this.canvas) {
      this.canvas.addPath(path);
    }

    return this.pathId-1;
  }

  onLayout = (event) => {
    if (this.state.dimensions) return; // layout was already called
    const { width, height, top, left } = event.nativeEvent.layout;

    let lines = this.state.lines;
    if (this.props.lines && this.props.lines.length > this.state.lines.length) {
      lines = this.props.lines.length ? this.props.lines.map(line => ({
        ...line,
        points: line.points.map(point => ({ ...point })),
      })) : [];
      this.setState({ rate: width / 100, dimensions: { width, height, top, left }, lines });
    } else {
      this.setState({ rate: width / 100, dimensions: { width, height, top, left } });
    }

    setTimeout(() => {
      for (const line of lines) {
        this.addPathToCanvas(line.points.filter(point => point.valid))
      }
    }, 500)
  }

  reset = () => {
    this.setState({ lines: [] });
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
      points: line.points.map(point => ({...point}))
    }));

    return { lines: results, currentIndex, width };
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
    const { dimensions, lines } = this.state;
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
        <SketchCanvas
          ref={(ref) => {
            this.canvas = ref;
          }}
          style={styles.blank}
          touchEnabled={false}
          strokeColor={'black'}
          strokeWidth={1.5}
          promptForExternalWritePermissions={false}
        />

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
