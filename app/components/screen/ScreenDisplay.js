import React from 'react';
import * as R from 'ramda';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { Markdown } from '../core';
import { markdownStyle } from '../../themes/activityTheme';

const styleLens = R.lensPath(['paragraph', 'fontWeight']);
const preambleStyle = R.set(styleLens, 'bold', markdownStyle);

const ScreenDisplay = ({ screen }) => (
  <View style={{ marginBottom: 18 }}>
    {screen.preamble && (
      <Markdown mstyle={preambleStyle}>
        {screen.preamble.en}
      </Markdown>
    )}
    {screen.question && (
      <Markdown>
        {screen.question.en}
      </Markdown>
    )}
  </View>
);

ScreenDisplay.propTypes = {
  screen: PropTypes.object.isRequired,
};

export default ScreenDisplay;
