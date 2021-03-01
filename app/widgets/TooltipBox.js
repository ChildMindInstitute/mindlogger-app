import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { View, Dimensions } from 'react-native';
import Tooltip from "rne-modal-tooltip";
import { truncateString } from '../services/helper';
import { MarkdownScreen } from '../components/core';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

const STEP_LOADED = 0;
const STEP_TRUNCATED = 1;
const STEP_RESIZED = 2;

export const TooltipBox = ({ text, children }) => {
  const [truncatedText, setTruncatedText] = useState(text);
  const [tooltipSize, setTooltipSize] = useState(null);
  const [step, setStep] = useState(STEP_LOADED);

  const textContainer = useMemo(() => (
    <MarkdownScreen>{truncatedText}</MarkdownScreen>
  ), [truncatedText]);

  return (
    <View>
      {step === STEP_RESIZED ? (
        <Tooltip
          width={tooltipSize.width}
          height={tooltipSize.height}
          popover={textContainer}
          toggleOnPress={true}
          withOverlay={false}
          skipAndroidStatusBar={true}
          containerStyle={{
            margin: 0,
            overflow: 'hidden',
          }}
          backgroundColor="#DEF"
        >
          { children }
        </Tooltip>
      ) : (
        <View
          style={{ position: 'absolute', width: windowWidth * 8 / 10 }}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            if (width > 0 && height > 0) {
              if (step === STEP_LOADED && height > windowHeight / 2) {
                const len = parseInt(truncatedText.length * (windowHeight / 3) / height);
                setTruncatedText(truncateString(truncatedText, len));
                setStep(STEP_TRUNCATED);
              } else {
                setTooltipSize({ width, height: height + 30 });
                setStep(STEP_RESIZED);
              }
            }
          }}
        >
          {textContainer}
        </View>
      )}
    </View>
  );
};

TooltipBox.defaultProps = {
  text: '',
};

TooltipBox.propTypes = {
  text: PropTypes.any,
};
