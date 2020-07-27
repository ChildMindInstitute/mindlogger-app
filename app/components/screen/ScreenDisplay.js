import React from 'react';
import * as R from 'ramda';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { MarkdownScreen } from '../core';
import { markdownStyle } from '../../themes/activityTheme';

const styleLens = R.lensPath(['paragraph', 'fontWeight']);
const preambleStyle = R.set(styleLens, 'bold', markdownStyle);

const ScreenDisplay = ({ screen }) => (
  <View style={{ marginBottom: 18 }}>
    {screen.preamble && (
      <MarkdownScreen mstyle={preambleStyle}>
        {screen.preamble.en}
      </MarkdownScreen>
    )}
    {screen.question && (
      <MarkdownScreen>
        {screen.question.en}
      </MarkdownScreen>
    )}
  </View>
);

ScreenDisplay.propTypes = {
  screen: PropTypes.object.isRequired,
};

export default ScreenDisplay;
