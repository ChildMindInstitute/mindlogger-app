import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { View, ScrollView, Dimensions } from 'react-native';
import { Tooltip } from 'react-native-elements';
import { MarkdownScreen } from '../components/core';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

const STEP_LOADED = 0;
const STEP_RESIZED = 1;

export const TooltipBox = ({ text, children }) => {
  const [tooltipSize, setTooltipSize] = useState(null);
  const [step, setStep] = useState(STEP_LOADED);

  const textContainer = useMemo(() => (
    <MarkdownScreen>{text}</MarkdownScreen>
  ), [text]);

  return (
    <View>
      {step === STEP_RESIZED ? (
        <Tooltip
          width={tooltipSize.width}
          height={tooltipSize.height}
          popover={
            <View
              style={{
                flex: 1,
                height: tooltipSize.height,
              }}
            >
              <ScrollView
                persistentScrollbar={true}
              >
                {textContainer}
              </ScrollView>
            </View>
          }
          withOverlay={false}
          skipAndroidStatusBar={true}
          closeOnlyOnBackdropPress={false}
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
              setTooltipSize({ width, height: Math.min(height, windowHeight / 3) + 30 });
              setStep(STEP_RESIZED);
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
