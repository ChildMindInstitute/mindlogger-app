import React from 'react';
import { Animated, Easing } from 'react-native';
import PropTypes from 'prop-types';
import Clock from './Clock';

const AnimatedClock = Animated.createAnimatedComponent(Clock);

class Timer extends React.Component {
  state = {
    timeline: new Animated.Value(0),
  }

  componentDidMount() {
    this.start();
  }

  stop = () => {
    const { timeline } = this.state;
    timeline.stopAnimation();
    timeline.setValue(0);
  }

  start = () => {
    const { duration } = this.props;
    Animated.timing(
      this.state.timeline,
      {
        toValue: 1,
        duration,
        easing: Easing.linear,
      },
    ).start();
  }

  render() {
    const { size, strokeWidth, color } = this.props;
    const { timeline } = this.state;
    return (
      <AnimatedClock
        size={size}
        strokeWidth={strokeWidth || (size / 2)}
        color={color}
        percentComplete={timeline}
      />
    );
  }
}

Timer.defaultProps = {
  size: 100,
  strokeWidth: undefined,
  color: '#303030',
};

Timer.propTypes = {
  size: PropTypes.number,
  strokeWidth: PropTypes.number,
  color: PropTypes.string,
  duration: PropTypes.number.isRequired,
};

export default Timer;
