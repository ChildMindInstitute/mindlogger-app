import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, PanResponder, StyleSheet, Image } from 'react-native';
import Svg, { Polyline, Circle, Text } from 'react-native-svg';
import ReactDOMServer from 'react-dom/server';
import { getData, storeData } from "../../services/asyncStorage";

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

export default class TrailsBoard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lines: [],
      failedCnt: 0,
      screenTime: 0,
      incorrectPoints: [],
      currentIndex: 1,
      currentScreen: 0,
      isValid: false,
      rate: 1,
    };
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
        this.props.onRelease();
        this.releaseLine(evt, gestureState);
      },
    });
    this.allowed = true;
  }

  async componentDidMount() {
    const { currentIndex, failedCnt, currentScreen } = this.props;
    const currentIntervalId = await getData('intervalId');
    let { screenTime } = this.props;

    if (currentIntervalId && currentScreen) {
      clearInterval(currentIntervalId);
    }

    this.timeInterval = setInterval(() => {
      const { currentIndex, failedCnt, currentScreen } = this.props;
      const { lines } = this.state;
      const result = this.save(lines, currentIndex);

      screenTime = screenTime ? screenTime + 1 : 1;
      if (currentScreen % 2 === 0 || screenTime < 180) {
        this.props.onResult({ ...result, screenTime, failedCnt: failedCnt });
        this.setState({ screenTime });
      } else {
        this.props.onResult({ ...result, screenTime, failedCnt: failedCnt }, true);
      }
    }, 1000)

    await storeData('intervalId', this.timeInterval);
    this.setState({ failedCnt: failedCnt ? failedCnt : 0 });
    this.setState({ currentIndex, currentScreen });
  }

  componentWillUnmount() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  startLine = (evt) => {
    const { screen } = this.props;
    const { lines, rate } = this.state;
    if (!this.allowed) return;
    const { locationX, locationY } = evt.nativeEvent;
    let isValid = false;
    let order = 0;

    this.props.onError();
    screen.items.forEach((item) => {
      const distance = Math.sqrt(Math.pow(item.cx * rate - locationX, 2) + Math.pow(item.cy * rate - locationY, 2));

      if (distance <= screen.r * rate) {
        this.startX = item.cx * rate;
        this.startY = item.cy * rate;
        order = item.order;
        isValid = true;
      }
    });
    
    this.setState({ isValid });
    if (isValid) {
      const newLine = { points: [{ x: this.startX, y: this.startY, time: Date.now(), order }] };
      this.setState({ lines: [...lines, newLine] });
    }
  }

  movePoint = (evt, gestureState) => {
    const { lines, isValid } = this.state;
    if (!this.allowed || lines.length === 0) return;

    const time = Date.now();
    const n = lines.length - 1;
    const { moveX, moveY, x0, y0 } = gestureState;

    if (isValid) {
      this.lastX = moveX - x0 + this.startX;
      this.lastY = moveY - y0 + this.startY;
      this.lastPressTimestamp = time;

      lines[n].points.push({ x: this.lastX, y: this.lastY, time, isValid: false });
      this.setState({ lines });
    }
  }

  releaseLine = (evt, gestureState) => {
    const { screen } = this.props;
    const { lines, isValid, rate } = this.state;
    let { currentIndex } = this.state;
    if (!this.allowed || !lines.length || !isValid) return;

    const { moveX, moveY, x0, y0 } = gestureState;
    const n = lines.length - 1;
    let validIndex = -1;
    let isValidLine = true;

    this.lastX = moveX - x0 + this.startX;
    this.lastY = moveY - y0 + this.startY;
    lines[n].points.push({ x: this.lastX, y: this.lastY, time: Date.now(), valid: false });

    lines[n].points.forEach((point, index) => {
      if (index === 0 && point.order !== currentIndex) {
        isValidLine = false;
      }
      if (index && isValidLine) {
        const item = screen.items.find(({ cx, cy }) => 
          Math.sqrt(Math.pow(cx * rate - point.x, 2) + Math.pow(cy * rate - point.y, 2)) < screen.r * rate
        );

        if (item && item.order !== currentIndex) {
          if (item.order === currentIndex + 1) {
            validIndex = index;
            currentIndex += 1;
          } else {
            isValidLine = false;
            validIndex = -1;
          }
        }
      }
    })

    if (validIndex === -1) {
      lines.pop();
      this.props.onError("Incorrect line!");
    } else {
      for (let i = 0; i < lines[n].points.length && i <= validIndex; i += 1) {
        lines[n].points[i].valid = true;
      }
    }

    this.props.onResult({ ...this.save(lines, currentIndex) });
    this.setState({ lines, currentIndex });
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
      this.setState({ rate: width / 335, dimensions: { width, height, top, left }, lines });
    } else {
      this.setState({ rate: width / 335, dimensions: { width, height, top, left } });
    }
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
      points: line.points.map(point => ({
        ...point,
        x: point.x / width * 100,
        y: point.y / width * 100,
      })),
    }));

    return { lines: results, currentIndex };
  }

  renderLine = (pointStr, idx) => (
    <Polyline
      key={idx}
      points={pointStr}
      fill="none"
      stroke="black"
      strokeWidth="1.5"
    />
  );

  renderTrailsData = (item, index, trailsData) => {
    const { screen } = this.props;
    const { currentIndex, incorrectPoints, rate } = this.state;
    let itemColor = trailsData.colors.pending;

    if (incorrectPoints.includes(index + 1)) {
      itemColor = trailsData.colors.failed;
    } else if (index < currentIndex) {
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
          y={(item.cy + 7) * rate}
          textAnchor="middle"
        >
          {item.label}
        </Text>

        {index === 0 && <Text
          stroke={trailsData.colors.pending}
          fontSize={12 * ((rate - 1) / 2 + 1)}
          fontWeight="200"
          x={item.cx * rate}
          y={(item.cy - 20) * rate}
          textAnchor="middle"
        >
          {`Begin`}
        </Text>}

        {index === screen.items.length - 1 && <Text
          fill="white"
          stroke={trailsData.colors.pending}
          fontSize={12 * ((rate - 1) / 2 + 1)}
          fontWeight="200"
          x={item.cx * rate}
          y={(item.cy - 20) * rate}
          textAnchor="middle"
        >
          {`End`}
        </Text>}
      </>
    )
  }

  renderSvg() {
    const { lines, dimensions } = this.state;
    const { screen } = this.props;
    const width = dimensions ? dimensions.width : 300;
    const strArray = chunkedPointStr(lines, 50);
    return (
      <Svg
        ref={(ref) => { this.svgRef = ref; }}
        height={width}
        width={width}
      >
        {strArray.map(this.renderLine)}
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

TrailsBoard.defaultProps = {
  imageSource: null,
  lines: [],
  currentIndex: 1,
  onResult: () => {},
  onPress: () => {},
  onRelease: () => {},
};

TrailsBoard.propTypes = {
  imageSource: PropTypes.string,
  lines: PropTypes.array,
  screen: PropTypes.object,
  currentIndex: PropTypes.number,
  currentScreen: PropTypes.number,
  onResult: PropTypes.func,
  onPress: PropTypes.func,
  onError: PropTypes.func,
  onRelease: PropTypes.func,
};
