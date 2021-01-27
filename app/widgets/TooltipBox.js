import React from 'react';
import PropTypes from 'prop-types';
import { Dimensions } from 'react-native';
import { Text } from 'native-base';
import { Tooltip } from 'react-native-elements';
import { truncateString } from '../services/helper';

const { width, height } = Dimensions.get('window');

const TOOLTIP_WIDTH_DEFAULT = 150;
const TOOLTIP_WIDTH_MAX = width * 8 / 10;
const TOOLTIP_LINE_HEIGHT = 25;
const LINE_TEXT_LEN = parseInt(width / 12);
const LINE_COUNT_MAX = parseInt(height / 2 / TOOLTIP_LINE_HEIGHT);
const TEXT_LEN_MAX = LINE_TEXT_LEN * LINE_COUNT_MAX;

export const TooltipBox = ({ text, children }) => {
  const truncatedText = truncateString(text, TEXT_LEN_MAX);
  const lineCount = parseInt(truncatedText.length / LINE_TEXT_LEN) + 1;
  const tooltipWidth = truncatedText.length >= LINE_TEXT_LEN ? TOOLTIP_WIDTH_MAX : TOOLTIP_WIDTH_DEFAULT;
  const tooltipHeight = TOOLTIP_LINE_HEIGHT * lineCount + 20;

  return (
    <Tooltip
      width={tooltipWidth}
      height={tooltipHeight}
      popover={<Text>{truncatedText}</Text>}
      toggleOnPress={true}
      withOverlay={false}
      skipAndroidStatusBar={true}
      containerStyle={{
        margin: 0,
      }}
    >
      { children }
    </Tooltip>
  );
};

TooltipBox.defaultProps = {
  text: '',
};

TooltipBox.propTypes = {
  text: PropTypes.any,
};
