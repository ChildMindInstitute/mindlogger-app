import React, { useState, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { View, Dimensions, ScrollView } from 'react-native';
import CustomTooltip from './CustomTooltip';
import { MarkdownScreen } from '../components/core';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

export const TooltipBox = ({ text, children }) => {
  const [height, setHeight] = useState(150);
  const [width, ] = useState(windowWidth * 2 / 3);
  const textContainer = useMemo(() => (
    <View
      onLayout={
        (evt) => {
          const { height } = evt.nativeEvent.layout;
          setHeight(Math.min(height + 20, 150));
        }
      }
    >
      <MarkdownScreen maxWidth={width} textColor='black'>{text}</MarkdownScreen>
    </View>
  ), [text]);

  return (
    <View>
      <CustomTooltip
        width={width}
        height={height}
        popover={textContainer}
        toggleOnPress={true}
        withOverlay={false}
        skipAndroidStatusBar={true}
        containerStyle={{
          margin: 0,
          overflow: 'hidden',
        }}
        backgroundColor="rgba(226, 240, 254, 1)"
      >
        { children }
      </CustomTooltip>
    </View>
  );
};

TooltipBox.defaultProps = {
  text: '',
};

TooltipBox.propTypes = {
  text: PropTypes.any,
};
