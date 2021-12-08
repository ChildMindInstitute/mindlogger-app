import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Image } from 'react-native';
import Svg, { Circle, Text } from 'react-native-svg';
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

export default class TrailsTutorial extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lines: [],
      currentIndex: 1,
      currentNumber: 0,
      rate: 1,
    };
    this.tutorialInterval = 0;
  }

  componentDidMount() {
    const { tutorial } = this.props;
    let i = 1;

    this.props.onNext(tutorial[0].text);
    this.tutorialInterval = setInterval(() => {
      if (i === tutorial.length) {
        this.props.onEnd();
        clearInterval(this.tutorialInterval);
      } else {
        this.props.onNext(tutorial[i].text);
        if (tutorial[i].number) {
          this.setState({ currentNumber: tutorial[i].number });
        } else {
          this.setState({ currentNumber: 0 });
        }
        i += 1;
      }
    }, 1000);
  }

  componentWillUnmount() {
    if (this.tutorialInterval) {
      clearInterval(this.tutorialInterval);
    }
  }

  reset = () => {
    this.setState({ lines: [] });
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

  renderTrailsData = (item, index, trailsData) => {
    const { screen } = this.props;
    const { rate, currentNumber } = this.state;
    let itemColor = trailsData.colors.pending;

    if (item.label == currentNumber) {
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
        <View style={styles.blank}>
          {dimensions && this.renderSvg()}
        </View>
      </View>
    );
  }
}

TrailsTutorial.defaultProps = {
  imageSource: null,
  lines: [],
  currentIndex: 1,
  onNext: () => {},
  onEnd: () => {},
};

TrailsTutorial.propTypes = {
  imageSource: PropTypes.string,
  lines: PropTypes.array,
  screen: PropTypes.object,
  currentIndex: PropTypes.number,
  currentScreen: PropTypes.number,
  tutorial: PropTypes.array,
  onNext: PropTypes.func,
  onEnd: PropTypes.func,
};
