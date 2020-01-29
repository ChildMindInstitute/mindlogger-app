import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { Text } from 'native-base';
import SliderComponent from 'react-native-slider';
import { getURL } from '../../services/helper';
import { colors } from '../../themes/colors';

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
    onPress: () => {},
    onRelease: () => {},
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
    minimumValue: 1,
    currentValue: null,
    maximumValue: 7,
    sliderWidth: 0,
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
    const { value } = this.props;

    this.sliderRef.current.measure((fx, fy, width) => {
      this.setState({ sliderWidth: width, currentValue: value });
    });
  };

  tapSliderHandler = (evt) => {
    const { sliderWidth, minimumValue } = this.state;
    const {
      onChange,
      config: { itemList },
    } = this.props;

    const calculatedValue = Math.ceil(
      Math.abs(evt.nativeEvent.locationX / sliderWidth).toFixed(1)
        * itemList.length
        + minimumValue
        - 1,
    );

    onChange(calculatedValue);
    this.setState({ currentValue: calculatedValue });
  };

  render() {
    const { minimumValue, maximumValue } = this.state;

    const {
      config: { maxValue, minValue, itemList },
      onChange,
      onPress,
      value,
      onRelease,
    } = this.props;

    return (
      <View style={styles.container}>
        <View style={styles.sliderWrapper}>
          <TouchableWithoutFeedback onPressIn={this.tapSliderHandler}>
            <View ref={this.sliderRef} onLayout={this.measureSliderWidth}>
              <SliderComponent
                value={value || Math.ceil((minimumValue + maximumValue) / 2)}
                onValueChange={value => this.setState({ currentValue: value })}
                minimumValue={minimumValue}
                maximumValue={maximumValue}
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
