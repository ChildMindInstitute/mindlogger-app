import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  View,
  Image,
  TouchableWithoutFeedback,
  StyleSheet,
  KeyboardAvoidingView,
} from "react-native";
import { Text } from "native-base";
import SliderComponent from "react-native-slider";
import { getURL } from "../../services/helper";
import { colors } from "../../themes/colors";
import { OptionalText } from '../OptionalText';

const testTicks = [
  { name: "One", value: 1 },
  { name: "Two", value: 2 },
  { name: "Three", value: 3 },
  { name: "Four", value: 4 },
  { name: "Five", value: 5 },
];

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 20,
  },
  sliderWrapper: {
    width: "100%",
    justifyContent: "center",
    // transform: [{ rotate: '-90deg' }],
    paddingLeft: 35,
    paddingRight: 35,
  },
  track: {
    height: 4,
    borderRadius: 2,
  },
  thumbUnselected: {
    width: 0,
    height: 0,
  },
  thumb: {
    width: 26,
    height: 26,
    borderRadius: 26 / 2,
    backgroundColor: colors.primary,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  label: { textAlign: "center" },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 45,
    height: 45,
    resizeMode: "contain",
  },
  labelContainer: {
    width: "100%",
    paddingTop: 35,
    justifyContent: "space-between",
    flexDirection: "row",
  },
  labelBox: { width: 100 },
  plusButton: {
    position: "absolute",
    paddingLeft: 6,
    paddingRight: 6,
    paddingTop: 7,
    paddingBottom: 0,
    borderRadius: 0,
    borderColor: "#008060",
    backgroundColor: "#eee",
    height: 30,
    bottom: 7,
    right: -15,
  },
  leftLabel: {
    fontSize: 25,
    fontWeight: "800",
    lineHeight: 25,
    color: colors.primary,
  },
  minusButton: {
    position: "absolute",
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 6,
    paddingBottom: 0,
    borderRadius: 0,
    borderColor: "#008060",
    backgroundColor: "#eee",
    height: 30,
    bottom: 5,
    left: -15,
  },
  rightLabel: {
    fontSize: 25,
    fontWeight: "800",
    lineHeight: 25,
    color: colors.primary,
  },
  tickMark: {
    position: "absolute",
    top: 30,
  },
  knobLabel: {
    position: "absolute",
    bottom: 40,
    minWidth: 50,
  },
  knobLabelText: {
    fontSize: 10,
    textAlign: "center",
  },
  ticks: {
    position: "absolute",
    left: 50,
    top: 20,
    flexDirection: "row",
  },
  tick: {
    position: "absolute",
    fontSize: 12,
    textAlign: "center",
  },
  tickLabel: {
    paddingLeft: 5,
    fontSize: 12,
    color: "#a0a0a0",
  },
});

class Slider extends Component {
  sliderRef = React.createRef();

  finalAnswer = {};

  handleComment = (itemValue) => {
    const {onChange} = this.props;
    this.finalAnswer["text"] = itemValue;
    onChange(this.finalAnswer);
  }

  static propTypes = {
    config: PropTypes.shape({
      minValue: PropTypes.string,
      maxValue: PropTypes.string,
      itemList: PropTypes.array,
    }).isRequired,
    appletName: PropTypes.string.isRequired,
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
      })
    );
    const maxValue = Math.max.apply(
      Math,
      itemList.map((item) => {
        return item.value;
      })
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
      ((width - 23) * (value - minimumValue)) / (maximumValue - minimumValue) +
      37
    );
  };

  handleValue = (value) => {
    const { minimumValue } = this.state;
    if (value <= minimumValue) {
      this.setState({ currentValue: minimumValue });
      this.finalAnswer["value"] = minimumValue;
    } else {
      this.setState({ currentValue: value });
      this.finalAnswer["value"] = value;
    }
  };

  tapSliderHandler = (evt) => {
    const { sliderWidth, minimumValue, maximumValue } = this.state;
    const {
      onChange,
      config: { itemList, continousSlider },
    } = this.props;

    if (sliderWidth) {
      const locationX = evt.nativeEvent.locationX - 20.5;
      const calculatedValue =
        Math.abs(locationX / (sliderWidth - 26) * (itemList.length - 1) + minimumValue);
      const value = calculatedValue > maximumValue
        ? maximumValue
        : (calculatedValue < minimumValue
          ? minimumValue
          : calculatedValue);
      const currentValue = continousSlider ? value : Math.round(value);
      this.finalAnswer["value"] = currentValue;

      onChange(this.finalAnswer);
      this.setState({ currentValue });
    }
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
      left: (sliderWidth * (value - minValue)) / (maxValue - minValue),
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
      <Text style={tickStyle} key={tick.value}>
        {tick.name}
      </Text>
    );
  };

  renderTicks() {
    const { sliderWidth } = this.state;
    const tickWidth = sliderWidth / testTicks.length;
    return (
      <View style={styles.ticks}>
        {testTicks.map((tick) => this.renderTick(tick, tickWidth))}
      </View>
    );
  }

  render() {
    const { currentValue, minimumValue, maximumValue, tickMarks } = this.state;
    const {
      config: {
        maxValue,
        minValue,
        itemList,
        textAnchors,
        tickLabel,
        tickMark,
        continousSlider,
        isOptionalText,
        isOptionalTextRequired,
        showTickMarks
      },
      onChange,
      onPress,
      value,
      onRelease,
    } = this.props;

    this.finalAnswer = value ? value : {};

    let currentVal = this.finalAnswer["value"];
    const step = itemList ? (continousSlider ? 0.01 : 1) : 0;

    if (!value && value !== currentValue) {
      this.setState({ currentValue: value });
    }

    if (currentVal !== null && currentVal < minimumValue) {
      currentVal = minimumValue;
    }

    return (
      <KeyboardAvoidingView
     // behavior="padding"
    >

      <View style={styles.container}>
        <View style={styles.sliderWrapper}>
          {tickMarks.map((tick) => (
            <View
              key={tick.value}
              style={[styles.tickMark, { left: tick.left }]}
            >
              {tickMark &&
                <Text style={styles.tickLabel}> l </Text>
              }
              {tickLabel &&
                <Text> {tick.value} </Text>
              }
            </View>
          ))}
          <TouchableWithoutFeedback onPressIn={this.tapSliderHandler}>
            <View ref={this.sliderRef} onLayout={this.measureSliderWidth}>
              <SliderComponent
                value={
                  currentVal < minimumValue
                    ? minimumValue
                    : currentVal > maximumValue
                    ? maximumValue
                    : currentVal
                }
                onValueChange={(value) => this.handleValue(value)}
                minimumValue={minimumValue}
                maximumValue={maximumValue}
                minimumTrackTintColor="#CCC"
                maximumTrackTintColor="#CCC"
                trackStyle={styles.track}
                thumbStyle={
                  currentVal >= minimumValue
                    ? styles.thumb
                    : styles.thumbUnselected
                }
                step={step}
                onSlidingStart={onPress}
                onSlidingComplete={(val) => {
                  onRelease();
                  this.finalAnswer["value"] = val;
                  onChange(this.finalAnswer);
                }}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>

        <View style={styles.labelContainer}>
          <View style={styles.labelBox}>
            {itemList[0]?.image && (
              <View style={styles.iconWrapper}>
                <Image
                  style={styles.icon}
                  source={{ uri: getURL(itemList[0]?.image) }}
                />
              </View>
            )}
            {textAnchors && (
              <Text style={styles.label}>{minValue}</Text>
            )}
          </View>
          <View style={styles.labelBox}>
            {itemList[itemList.length - 1]?.image && (
              <View style={styles.iconWrapper}>
                <Image
                  style={styles.icon}
                  source={{ uri: getURL(itemList[itemList.length - 1]?.image) }}
                />
              </View>
            )}
            {textAnchors && (
              <Text style={styles.label}>{maxValue}</Text>
            )}
          </View>
        </View>

        { isOptionalText &&
          <OptionalText
            onChangeText={text=>this.handleComment(text)}
            value={this.finalAnswer["text"]}
            isRequired={isOptionalTextRequired}
          />
        }
      </View>
      </KeyboardAvoidingView>
    );
  }
}

export { Slider };
