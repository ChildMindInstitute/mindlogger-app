import React from 'react';
import { View, StyleSheet, Text, ImageBackground, Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import Svg, { Rect, Circle, Mask, Defs, LinearGradient, Stop } from 'react-native-svg';
import TimerBackground from '../../../img/behavior_timer.png';
import TimerNoLimit from '../../../img/behavior_timer_no_limit.png';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  timeElapsed: {
    position: 'absolute',
    bottom: 0,
    width: width / 6,
    height: 36,
    justifyContent: 'center'
  },
  timeLeft: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: width / 6,
    height: 36,
    justifyContent: 'center'
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
  }
});

const TimerProgress = ({ current, length, color, sliderColor }) => {
  const getTimeStr = (total) => {
    const mins = Math.floor(total / 60);
    const secs = Math.floor(total) % 60;

    return mins + ':' + `0${secs}`.substr(-2)
  }

  return (
    <View>
      <View>
        <ImageBackground
          style={{
            width: '100%', height: 36, marginBottom: 5
          }}
          source={length ? TimerBackground : TimerNoLimit}
        />

        <View style={styles.timeElapsed}>
          <Text style={{ ...styles.text, color }}>{getTimeStr(current)}</Text>
        </View>

        {
          length && (
            <View style={styles.timeLeft}>
              <Text style={{ ...styles.text, color }}>{'-' + getTimeStr(length-current)}</Text>
            </View>
          ) || <></>
        }
      </View>

      <Svg width={width} height={10}>
        <Defs>
          <LinearGradient id="background" x1="0%" x2="0%" y1="0%" y2="100%">
            <Stop offset="0" stopColor={'#D2DAE0'} stopOpacity={1} key='0' />
            <Stop offset="1" stopColor={'#D8E1E8'} stopOpacity={1} key='1' />
          </LinearGradient>
        </Defs>

        <Rect x={0} y={0} width={width} height={10} fill='url(#background)' />
        <Rect x={0} y={0} width={length ? width * current / length : width} height={10} fill={sliderColor} />
      </Svg>
    </View>
  );
};

TimerProgress.defaultProps = {
  index: 0,
  length: 1,
};

TimerProgress.propTypes = {
  index: PropTypes.number,
  length: PropTypes.number,
  color: PropTypes.string,
  sliderColor: PropTypes.string
};

export default TimerProgress;
