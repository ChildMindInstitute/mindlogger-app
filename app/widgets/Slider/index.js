import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { Button, Text } from 'native-base';
import SliderComponent from 'react-native-slider';
import { getURL } from '../../services/helper';
import { colors } from '../../themes/colors';

const testTicks = [
  { name: 'One', value: 1 },
  { name: 'Two', value: 2 },
  { name: 'Three', value: 3 },
  { name: 'Four', value: 4 },
  { name: 'Five', value: 5 },
];

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 20,
    paddingRight: 20,
    paddingLeft: 20,
  },
  sliderWrapper: {
    width: '100%',
    justifyContent: 'center',
    // transform: [{ rotate: '-90deg' }],
    paddingLeft: 35,
    paddingRight: 35,
  },
  track: {
    height: 4,
    borderRadius: 2,
  },
  thumbUnselected: {
    width: 26,
    height: 26,
    borderRadius: 26 / 2,
    backgroundColor: 'transparent',
    borderColor: '#919191',
    borderWidth: 2,
    elevation: 2,
    borderStyle: 'dotted',
  },
  thumb: {
    width: 26,
    height: 26,
    borderRadius: 26 / 2,
    backgroundColor: colors.primary,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  label: { textAlign: 'center' },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 45,
    height: 45,
    resizeMode: 'cover',
  },
  labelContainer: {
    width: '100%',
    paddingTop: 35,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  labelBox: { width: 100 },
  plusButton: {
    position: 'absolute',
    paddingLeft: 6,
    paddingRight: 6,
    paddingTop: 7,
    paddingBottom: 0,
    borderRadius: 0,
    borderColor: '#008060',
    backgroundColor: '#eee',
    height: 30,
    bottom: 7,
    right: -15,
  },
  leftLabel: {
    fontSize: 25,
    fontWeight: '800',
    lineHeight: 25,
    color: colors.primary,
  },
  minusButton: {
    position: 'absolute',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 6,
    paddingBottom: 0,
    borderRadius: 0,
    borderColor: '#008060',
    backgroundColor: '#eee',
    height: 30,
    bottom: 5,
    left: -15,
  },
  rightLabel: {
    fontSize: 25,
    fontWeight: '800',
    lineHeight: 25,
    color: colors.primary,
  },
  tickMark: {
    position: 'absolute',
    bottom: -33,
  },
  knobLabel: {
    position: 'absolute',
    bottom: 40,
    minWidth: 50,
  },
  knobLabelText: {
    fontSize: 10,
    textAlign: 'center',
  },
  ticks: {
    position: 'absolute',
    left: 50,
    top: 20,
    flexDirection: 'row',
  },
  tick: {
    position: 'absolute',
    fontSize: 12,
    textAlign: 'center',
  },
  tickLabel: {
    paddingLeft: 5,
    fontSize: 12,
    color: '#a0a0a0',
  },
});

class Slider extends Component {
  sliderRef = React.createRef();

  static propTypes = {
    config: PropTypes.shape({
      minValue: PropTypes.string,
      maxValue: PropTypes.string,
      itemList: PropTypes.array,
    }).isRequired,
    value: PropTypes.number,
    onChange: PropTypes.func.isRequired,
    onPress: PropTypes.func,
    onRelease: PropTypes.func,
  };

  static defaultProps = {
    value: undefined,
    onPress: () => {},
    onRelease: () => {},
  };

  state = {
    minimumValue: 1,
    currentValue: null,
    maximumValue: 7,
    sliderWidth: 0,
    tickMarks: [],
  };

  componentDidMount() {
    const {
      config: { itemList },
    } = this.props;
    const minValue = Math.min.apply(
      Math,
      itemList.map((item) => {
        return item.value;
      }),
    );
    const maxValue = Math.max.apply(
      Math,
      itemList.map((item) => {
        return item.value;
      }),
    );


    this.setState({ minimumValue: minValue, maximumValue: maxValue });
  }

  measureSliderWidth = () => {
    const { minimumValue, maximumValue } = this.state;
    const { value } = this.props;
    this.sliderRef.current.measure((fx, fy, width) => {
      const tickMarks = this.getTickMarks(minimumValue, maximumValue, width);
      this.setState({ sliderWidth: width, currentValue: value, tickMarks });
    });
  };

  getTickMarks = (start, end, width) => {
    const tickMark = {
      value: start,
      left: this.getTickMark(start, width),
    };
    if (start === end) {
      return [tickMark];
    }
    return [tickMark, ...this.getTickMarks(start + 1, end, width)];
  };

  getTickMark = (value, width) => {
    const { minimumValue, maximumValue } = this.state;
    if (value === minimumValue) {
      return 37;
    }
    if (value === maximumValue) {
      return 14 + width;
    }

    return (
      (width - 23) * (value - minimumValue) / (maximumValue - minimumValue) + 37
    );
  };

  handleValue = (value) => {
    const { minimumValue } = this.state;
    if (value <= minimumValue) {
      this.setState({ currentValue: minimumValue });
    } else {
      this.setState({ currentValue: value });
    }
  }

  tapSliderHandler = (evt) => {
    const { sliderWidth, minimumValue } = this.state;
    const {
      onChange,
      config: { itemList },
    } = this.props;

    if (sliderWidth) {
      const calculatedValue = Math.ceil(
        Math.abs(evt.nativeEvent.locationX / sliderWidth).toFixed(1)
          * itemList.length
          + minimumValue
          - 1,
      );

      onChange(calculatedValue);
      this.setState({ currentValue: calculatedValue });
    }
  };

  calculateLabelPosition = () => {
    const { currentValue, sliderWidth, minimumValue, maximumValue } = this.state;
    if (!currentValue) {
      return 22;
    }
    if (currentValue === minimumValue) {
      return 22;
    }
    if (currentValue === maximumValue) {
      return sliderWidth;
    }

    return (
      sliderWidth * (currentValue - minimumValue) / (maximumValue - minimumValue)
      + (22 - 22 * currentValue / maximumValue)
    );
  };

  getTickPosition = (value) => {
    const { sliderWidth } = this.state;
    const minValue = 1;
    const maxValue = testTicks.length;

    if (value === minValue) {
      return {
        left: 0,
      };
    }
    if (value === maxValue) {
      return {
        left: sliderWidth - 5,
      };
    }
    return {
      left: sliderWidth * (value - minValue) / (maxValue - minValue),
    };
  };

  renderTick = (tick, tickWidth) => {
    const tickStyle = [
      styles.tick,
      {
        width: tickWidth - 20,
        transform: [{ translateX: -tickWidth / 2 }],
      },
      this.getTickPosition(tick.value, tickWidth),
    ];
    return (
      <Text style={tickStyle} key={tick.value}>{tick.name}</Text>
    );
  };

  onPressMinus = () => {
    const { minimumValue, maximumValue } = this.state;
    const { value, onChange } = this.props;
    let currentVal;

    if (value >= minimumValue) {
      currentVal = value - 0.25;
    } else {
      currentVal = (minimumValue + maximumValue) / 2 + 0.25;
    }

    if (currentVal < minimumValue) {
      currentVal = minimumValue;
    }

    onChange(currentVal);
    this.setState({ currentValue: currentVal });
  };

  onPressPlus = () => {
    const { minimumValue, maximumValue } = this.state;
    const { value, onChange } = this.props;
    let currentVal;

    if (value >= minimumValue) {
      currentVal = value + 0.25;
    } else {
      currentVal = (minimumValue + maximumValue) / 2 + 0.25;
    }

    if (currentVal > maximumValue) {
      currentVal = maximumValue;
    }

    onChange(currentVal);
    this.setState({ currentValue: currentVal });
  };

  renderTicks() {
    const { sliderWidth } = this.state;
    const tickWidth = sliderWidth / testTicks.length;
    return (
      <View style={styles.ticks}>
        {
          testTicks.map(tick => this.renderTick(tick, tickWidth))
        }
      </View>
    );
  }

  render() {
    const { currentValue, minimumValue, maximumValue, tickMarks } = this.state;

    const {
      config: { maxValue, minValue, itemList },
      onChange,
      onPress,
      value,
      onRelease,
    } = this.props;

    let currentVal = value;

    if (currentVal === minimumValue - 1) {
      currentVal = minimumValue;
    }

    const labelPosition = currentValue ? this.calculateLabelPosition() : 22;
    return (
      <View style={styles.container}>
        <View style={styles.sliderWrapper}>
          {currentVal !== null && (
          <View style={[styles.knobLabel, { left: labelPosition }]}>
            <Text style={styles.knobLabelText}>
              {currentVal >= minimumValue ? Math.round(currentValue * 100) / 100 : ''}
            </Text>
          </View>
          )}
          <Button onPress={this.onPressPlus} style={styles.plusButton}>
            <Text style={styles.leftLabel}>
              +
            </Text>
          </Button>
          {tickMarks.map(tickMark => (
            <View key={tickMark.value} style={[styles.tickMark, { left: tickMark.left }]}>
              <Text style={styles.tickLabel}> l </Text>
              <Text> { tickMark.value } </Text>
            </View>
          ))}
          <TouchableWithoutFeedback onPressIn={this.tapSliderHandler}>
            <View ref={this.sliderRef} onLayout={this.measureSliderWidth}>
              <SliderComponent
                value={currentVal >= minimumValue
                  ? currentVal : (minimumValue + maximumValue) / 2}
                onValueChange={value => this.handleValue(value)}
                minimumValue={minimumValue}
                maximumValue={maximumValue}
                minimumTrackTintColor="#CCC"
                maximumTrackTintColor="#CCC"
                trackStyle={styles.track}
                thumbStyle={currentVal >= minimumValue ? styles.thumb : styles.thumbUnselected}
                step={itemList ? 0.05 : 0}
                onSlidingStart={onPress}
                onSlidingComplete={(val) => {
                  onRelease();
                  onChange(val);
                }}
              />
            </View>
          </TouchableWithoutFeedback>
          <Button onPress={this.onPressMinus} style={styles.minusButton}>
            <Text style={styles.leftLabel}>
              -
            </Text>
          </Button>
        </View>

        <View style={styles.labelContainer}>
          <View style={styles.labelBox}>
            {itemList[0].image && (
              <View style={styles.iconWrapper}>
                <Image
                  style={styles.icon}
                  source={{ uri: getURL(itemList[0].image) }}
                />
              </View>
            )}
            <Text style={styles.label}>{minValue}</Text>
          </View>
          <View style={styles.labelBox}>
            {itemList[itemList.length - 1].image && (
              <View style={styles.iconWrapper}>
                <Image
                  style={styles.icon}
                  source={{ uri: getURL(itemList[itemList.length - 1].image) }}
                />
              </View>
            )}
            <Text style={styles.label}>{maxValue}</Text>
          </View>
        </View>
      </View>
    );
  }
}

export { Slider };
