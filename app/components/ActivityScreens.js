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
      activeScreens: this.preLoadFlanker([props.currentScreen]),
    };
  }

  preLoadFlanker(activeScreens) {
    const activity = this.props.activity;

    for (let i = 0; i < activity.items.length; i++) {
      if (
        activity.items[i].inputType == "visual-stimulus-response" &&
        !activeScreens.includes(i)
      ) {
        activeScreens.unshift(i);
      }
    }
    return activeScreens;
  }

  defineFlankerPosition() {
    const activity = this.props.activity;
    const currentScreen = this.props.currentScreen;

    const flankerIndexes = [];

    for (let i = 0; i < activity.items.length; i++) {
      if (activity.items[i].inputType == "visual-stimulus-response") {
        flankerIndexes.push(i);
      }
    }

    if (!flankerIndexes.length) {
      return null;
    }

    return {
      isFirst: currentScreen === flankerIndexes[0],
      isLast: currentScreen === flankerIndexes.pop(),
    };
  }

  componentDidUpdate(oldProps) {
    if (oldProps.currentScreen !== this.props.currentScreen) {
      // eslint-disable-next-line
      const activeScreens = [oldProps.currentScreen, this.props.currentScreen];

      this.setState({
        activeScreens: this.preLoadFlanker(activeScreens),
        direction: calcPosition(
          oldProps.currentScreen,
          this.props.currentScreen
        ),
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

    const flankerPosition = this.defineFlankerPosition()

    return (
      <View
        onTouchStart={this.props.onAnyTouch}
        style={{ flex: 1, width: "100%", position: "relative" }}
      >
        {activeScreens.map((index) => (
          <SlideInView
            key={`${activity.id}-screen-${index}`}
            style={{
              position: "absolute",
              height: "100%",
              width: "100%",
            }}
            position={calcPosition(currentScreen, index)}
            slideInFrom={direction}
          >
            <ActivityScreen
              activity={activity}
              screen={activity.items[index]}
              answer={answers[index]}
              answers={answers}
              onChange={onChange}
              authToken={authToken}
              hasSplashScreen={hasSplashScreen}
              currentScreen={currentScreen}
              isCurrent={index === currentScreen}
              onContentError={onContentError}
              flankerPosition={flankerPosition}
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
