import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Screen from './screen';
import SlideInView from './SlideInView';

const calcPosition = (currentScreen, index) => {
  if (currentScreen < index) {
    return 'right';
  }
  if (currentScreen > index) {
    return 'left';
  }
  return 'middle';
};

const ActivityScreens = ({
  activity,
  answers,
  currentScreen,
  onChange,
  authToken,
}) => (
  <View style={{ flex: 1, width: '100%', position: 'relative' }}>
    {
      activity.items.map((item, index) => (
        <SlideInView
          key={`${activity.id}-screen-${index}`}
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
          }}
          position={calcPosition(currentScreen, index)}
        >
          <Screen
            screen={item}
            answer={answers[index]}
            onChange={onChange}
            authToken={authToken}
            isCurrent={index === currentScreen}
          />
        </SlideInView>
      ))
    }
  </View>
);

ActivityScreens.propTypes = {
  activity: PropTypes.object.isRequired,
  answers: PropTypes.array.isRequired,
  currentScreen: PropTypes.number.isRequired,
  authToken: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ActivityScreens;
