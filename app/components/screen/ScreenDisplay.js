import React from 'react';
import * as R from 'ramda';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { MarkdownScreen } from '../core';
import { Markdown } from '../core';
import { markdownStyle } from '../../themes/activityTheme';

const styleLens = R.lensPath(['paragraph', 'fontWeight']);
const preambleStyle = R.set(styleLens, 'bold', markdownStyle);

const styles = StyleSheet.create({
  infoTitle: {
    textAlign: 'center',
    borderWidth: 1,
  },
});

const ScreenDisplay = ({ screen }) => {
  return (
  <View style={{ marginBottom: 18 }}>
    {screen.preamble && (
      <MarkdownScreen mstyle={preambleStyle}>
        {screen.preamble.en}
      </MarkdownScreen>
    )}
    {screen.question && (screen.inputType === 'markdownMessage' && (
      <MarkdownScreen>
        {screen.question.en}
      </MarkdownScreen>
    ) || (
      <Markdown>{screen.question.en}</Markdown>
    ))}
    {screen.info && (
      <View style={styles.infoTitle}>
        <MarkdownScreen>
          {screen.info.en}
        </MarkdownScreen>
      </View>
    )}
  </View>)
};

ScreenDisplay.propTypes = {
  screen: PropTypes.object.isRequired,
};

export default ScreenDisplay;
