import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import PropTypes from 'prop-types';
import { Dimensions } from 'react-native';
import Svg, { Rect, Circle, Mask, Defs, LinearGradient, Stop } from 'react-native-svg';

const styles = StyleSheet.create({
  container: {
    shadowColor: 'grey',
    shadowRadius: 4,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: -4 },
    height: 36
  },
  timeElapsed: {
    position: 'absolute',
    width: 100,
    height: 36,
    borderTopRightRadius: 18,
    marginBottom: 5,
    backgroundColor: 'white',
    justifyContent: 'center'
  },
  timeLeft: {
    position: 'absolute',
    width: 100,
    height: 36,
    right: 0,
    borderTopLeftRadius: 18,
    backgroundColor: 'white',
    justifyContent: 'center'
  },
  bottom: {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: 5,
    bottom: 0,
    backgroundColor: 'white'
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
  }
});

const TimerProgress = ({ current, length, color, sliderColor }) => {
  const { width } = Dimensions.get('window');
  const r = 18;

  const getTimeStr = (total) => {
    const mins = Math.floor(total / 60);
    const secs = total % 60;

    return mins + ':' + `0${secs}`.substr(-2)
  }

  return (
    <View style={{ paddingTop: 10 }}>
      <View
        style={{
          width,
          ...styles.container,
        }}
      >
        <Svg
          styles={{ position: 'absolute' }}
          width={width}
          height={styles.container.height}
        >
          <Defs>
            <Mask id="region">
              <Rect x={width-styles.timeLeft.width-r} y={r} width={r} height={r} fill="white" />
              <Rect x={styles.timeElapsed.width} y={r} width={r} height={r} fill="white" />

              <Circle x={width-styles.timeLeft.width-r} y={r} r={r} fill="black" />
              <Circle x={styles.timeElapsed.width+r} y={r} r={r} fill="black" />
            </Mask>
          </Defs>

          <Rect x={0} width={width} y={0} height={styles.container.height} fill="white" mask="url(#region)" fill="white" />
        </Svg>

        <View style={styles.timeElapsed}>
          <Text style={{ ...styles.text, color }}>{getTimeStr(current)}</Text>
        </View>

        <View style={styles.timeLeft}>
          <Text style={{ ...styles.text, color }}>-{getTimeStr(length-current)}</Text>
        </View>
        <View style={styles.bottom} />
      </View>

      <Svg width={width} height={10}>
        <Defs>
          <LinearGradient id="background" x1="0%" x2="0%" y1="0%" y2="100%">
            <Stop offset="0" stopColor={'#D2DAE0'} stopOpacity={1} key='0' />
            <Stop offset="1" stopColor={'#D8E1E8'} stopOpacity={1} key='1' />
          </LinearGradient>
        </Defs>

        <Rect x={0} y={0} width={width} height={10} fill='url(#background)' />
        <Rect x={0} y={0} width={width * current / length} height={10} fill={sliderColor} />
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
