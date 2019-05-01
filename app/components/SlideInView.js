import React from 'react';
import PropTypes from 'prop-types';
import { Animated, Dimensions } from 'react-native';

const mapPositionToInt = (position) => {
  if (position === 'left') {
    return -1;
  }
  if (position === 'right') {
    return 1;
  }
  return 0;
};

export default class SlideInView extends React.Component {
  constructor(props) {
    super(props);
    const { position } = props;
    this.state = {
      xPos: new Animated.Value(mapPositionToInt(position)),
    };
  }

  componentDidUpdate(prevProps) {
    const { position } = this.props;
    if (prevProps.position !== position) {
      Animated.spring(
        this.state.xPos,
        {
          toValue: mapPositionToInt(position),
          friction: 7,
          tension: 20,
        },
      ).start();
    }
  }

  render() {
    const { children, style = {}, position } = this.props;
    const { xPos } = this.state;
    const { width } = Dimensions.get('window');
    return (
      <Animated.View
        style={{
          ...style,
          transform: [
            {
              translateX: xPos.interpolate({
                inputRange: [-1, 0, 1],
                outputRange: [width * -1, 0, width],
              }),
            },
          ],
          opacity: xPos.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [0, 1, 0],
          }),
        }}
        pointerEvents={position !== 'left' && position !== 'right' ? 'auto' : 'none'}
      >
        {children}
      </Animated.View>
    );
  }
}

SlideInView.defaultProps = {
  position: undefined,
  style: {},
};

SlideInView.propTypes = {
  position: PropTypes.string,
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
};
