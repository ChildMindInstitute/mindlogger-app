import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Image, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { Text } from 'native-base';
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
    width: 35,
    height: 35,
    borderRadius: 35 / 2,
    backgroundColor: 'transparent',
    borderColor: '#919191',
    borderWidth: 2,
    elevation: 2,
    borderStyle: 'dotted',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
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
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  labelBox: { width: 100 },
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
});


class Slider extends Component {
  static defaultProps = {
    value: undefined,
    onPress: () => {
    },
    onRelease: () => {
    },
  };

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

  sliderRef = React.createRef();

  state = {
    currentValue: null,
    sliderWidth: 0,
  };

  measureSliderWidth = () => {
    const { value } = this.props;

    this.sliderRef.current.measure((fx, fy, width) => {
      this.setState({ sliderWidth: width, currentValue: value });
    });
  };

  tapSliderHandler = (evt) => {
    const { sliderWidth } = this.state;
    const { onChange, config: { itemList } } = this.props;

    const calculatedValue = Math.ceil(
      Math.abs(
        (evt.nativeEvent.locationX / sliderWidth),
      ).toFixed(1) * itemList.length,
    );

    onChange(calculatedValue);
    this.setState({ currentValue: calculatedValue });
  };

  /*
  * Magic number 20 is a vertical padding of the parent component
  * */
  calculateLabelPosition = () => {
    const {
      config: { itemList },
    } = this.props;
    const { currentValue, sliderWidth } = this.state;
    const minValue = 1;
    const maxValue = itemList.length;

    if (currentValue === minValue) {
      return 20;
    }
    if (currentValue === maxValue) {
      return sliderWidth;
    }

    return (
      sliderWidth * (currentValue - minValue) / (itemList.length - minValue)
      + (20 / (currentValue - minValue))
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
    const { currentValue } = this.state;
    const {
      config: {
        maxValue,
        minValue,
        itemList,
      },
      onChange,
      onPress,
      value,
      onRelease,
    } = this.props;

    const left = this.calculateLabelPosition();

    return (
      <View style={styles.container}>
        <View style={styles.sliderWrapper}>
          {!!currentValue && (
          <View style={[styles.knobLabel, { left }]}>
            <Text style={styles.knobLabelText}>
              {currentValue}
            </Text>
          </View>
          )}
          <TouchableWithoutFeedback onPressIn={this.tapSliderHandler}>
            <View ref={this.sliderRef} onLayout={this.measureSliderWidth}>
              <SliderComponent
                value={value || Math.ceil((itemList.length) / 2)}
                onValueChange={value => this.setState({ currentValue: value })}
                minimumValue={1}
                maximumValue={itemList.length || 100}
                minimumTrackTintColor="#CCC"
                maximumTrackTintColor="#CCC"
                trackStyle={styles.track}
                thumbStyle={value ? styles.thumb : styles.thumbUnselected}
                step={itemList ? 1 : 0}
                onSlidingStart={onPress}
                onSlidingComplete={(val) => {
                  onRelease();
                  onChange(val);
                }}
              />
            </View>
          </TouchableWithoutFeedback>
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
