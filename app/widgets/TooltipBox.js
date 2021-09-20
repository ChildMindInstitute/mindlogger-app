import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { View, Dimensions, ScrollView } from 'react-native';
import CustomTooltip from './CustomTooltip';
import { MarkdownScreen } from '../components/core';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

export const TooltipBox = ({ text, children }) => {
  const textContainer = useMemo(() => (
    <MarkdownScreen textColor='white'>{text}</MarkdownScreen>
  ), [text]);

  return (
    <View>
      <CustomTooltip
        width={windowWidth*2/3}
        height={200}
        popover={textContainer}
        toggleOnPress={true}
        withOverlay={false}
        skipAndroidStatusBar={true}
        containerStyle={{
          margin: 0,
          overflow: 'hidden',
        }}
        backgroundColor="rgba(0, 0, 0, 0.9)"
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
