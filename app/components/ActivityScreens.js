import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import ActivityScreen from './screen';
import SlideInView from './SlideInView';

export const calcPosition = (currentScreen, index) => {
  if (currentScreen < index) {
    return 'right';
  }
  if (currentScreen > index) {
    return 'left';
  }
  return 'middle';
};

class ActivityScreens extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      activeScreens: [props.currentScreen],
    };
  }

  componentDidUpdate(oldProps) {
    if (oldProps.currentScreen !== this.props.currentScreen) {
      // eslint-disable-next-line
      this.setState({
        activeScreens: [oldProps.currentScreen, this.props.currentScreen],
        direction: calcPosition(oldProps.currentScreen, this.props.currentScreen),
      });
    }
  }

  render() {
    const {
      activity,
      answers,
      currentScreen,
      onChange,
      authToken,
      onContentError,
      hasSplashScreen,
    } = this.props;
    const { activeScreens, direction } = this.state;
    
    return (
      <View onTouchStart={this.props.onAnyTouch} style={{ flex: 1, width: '100%', position: 'relative' }}>
        {activeScreens.map(index => (
          <SlideInView
            key={`${activity.id}-screen-${index}`}
            style={{
              position: 'absolute',
              height: '100%',
              width: '100%',
            }}
            position={calcPosition(currentScreen, index)}
            slideInFrom={direction}
          >
            <ActivityScreen
              activity={activity}
              screen={activity.items[index]}
              answer={answers[index]}
              onChange={onChange}
              authToken={authToken}
              hasSplashScreen={hasSplashScreen}
              currentScreen={currentScreen}
              isCurrent={index === currentScreen}
              onContentError={onContentError}
            />
          </SlideInView>
        ))}
      </View>
    );
  }
}

ActivityScreens.propTypes = {
  activity: PropTypes.object.isRequired,
  answers: PropTypes.array.isRequired,
  currentScreen: PropTypes.number.isRequired,
  authToken: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onContentError: PropTypes.func.isRequired,
  onAnyTouch: PropTypes.func.isRequired,
};

export default ActivityScreens;
