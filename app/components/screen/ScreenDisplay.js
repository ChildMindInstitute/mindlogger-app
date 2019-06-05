import React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { MarkdownView } from 'react-native-markdown-view';
import { markdownStyle } from '../../themes/activityTheme';

const ScreenDisplay = ({ screen }) => (
  <View style={{ marginBottom: 18 }}>
    {screen.preamble && <MarkdownView markdownStyles={markdownStyle}>{screen.preamble.en}</MarkdownView>}
    {screen.question && <MarkdownView markdownStyles={markdownStyle}>{screen.question.en}</MarkdownView>}
  </View>
);

ScreenDisplay.propTypes = {
  screen: PropTypes.object.isRequired,
};

export default ScreenDisplay;
