import React from 'react';
import PropTypes from 'prop-types';
import { View, Image, StyleSheet } from 'react-native';
import { Text } from 'native-base';
import SliderComponent from 'react-native-slider';
import { getURL } from '../../services/helper';
import { colors } from '../../themes/colors';

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingTop: 20 },
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
    width: 25,
    height: 25,
    borderRadius: 25 / 2,
    backgroundColor: 'white',
    borderColor: '#DDD',
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  label: { textAlign: 'center' },
  iconWrapper: { justifyContent: 'center', alignItems: 'center' },
  icon: { width: 45, height: 45, resizeMode: 'cover' },
  labelContainer: { width: '100%', justifyContent: 'space-between', flexDirection: 'row' },
  labelBox: { width: 100 },
});

export const Slider = ({
  config: { maxValue, minValue, itemList },
  value,
  onChange,
  onPress,
  onRelease,
}) => (
  <View style={styles.container}>
    <View style={styles.sliderWrapper}>
      <SliderComponent
        value={value || 1}
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

Slider.defaultProps = {
  value: undefined,
  onPress: () => {},
  onRelease: () => { },
};

Slider.propTypes = {
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
