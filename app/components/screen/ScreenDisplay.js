import React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { Markdown } from '../core';

const ScreenDisplay = ({ screen }) => (
  <View style={{ marginBottom: 18 }}>
    {screen.preamble && (
      <Markdown>
        {screen.preamble.en}
      </Markdown>
    )}
    {screen.question && (
      <Markdown mstyle={{color: 'red'}}>
        {screen.question.en}
      </Markdown>
    )}
  </View>
);

ScreenDisplay.propTypes = {
  screen: PropTypes.object.isRequired,
};

export default ScreenDisplay;
