import React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import Markdown from 'react-native-easy-markdown';
import { markdownStyle } from '../../themes/activityTheme';

const ScreenDisplay = ({ screen }) => (
  <View>
    {screen.preamble && <Markdown markdownStyles={markdownStyle}>{screen.preamble.en}</Markdown>}
    {screen.question && <Markdown markdownStyles={markdownStyle}>{screen.question.en}</Markdown>}
  </View>
);

ScreenDisplay.propTypes = {
  screen: PropTypes.object.isRequired,
};

export default ScreenDisplay;
