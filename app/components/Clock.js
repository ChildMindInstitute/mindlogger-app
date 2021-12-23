import React from 'react';
import PropTypes from 'prop-types';
import { Svg, Circle } from 'react-native-svg';

class Clock extends React.Component {
  render() {
    const { percentComplete, color, size, strokeWidth } = this.props;
    return (
      <Svg
        height={size}
        width={size}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={(size - strokeWidth) / 2}
          fill="transparent"
          stroke="rgba(0, 0, 0, 0.1)"
          strokeWidth={strokeWidth}
        /> 
        <Circle
          rotation={-90}
          originX={size / 2}
          originY={size / 2}
          cx={size / 2}
          cy={size / 2}
          r={(size - strokeWidth) / 2}
          fill="transparent"
          stroke="rgba(0, 103, 160, 0.4)"
          strokeWidth={strokeWidth}
          strokeDashoffset={Math.PI * (size - strokeWidth) * (1 - percentComplete)}
          strokeDasharray={Math.PI * (size - strokeWidth)}
        />
      </Svg>
    );
  }
}

Clock.defaultProps = {
  percentComplete: 0,
  color: '#333333',
  size: 60,
  strokeWidth: 10,
};

Clock.propTypes = {
  percentComplete: PropTypes.number,
  color: PropTypes.string,
  size: PropTypes.number,
  strokeWidth: PropTypes.number,
};

export default Clock;
