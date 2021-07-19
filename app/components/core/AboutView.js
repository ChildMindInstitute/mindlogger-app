import React from "react";
import PropTypes from "prop-types";
import * as R from "ramda";
import { View } from "react-native";
import { StyleSheet } from 'react-native';
import { MarkdownScreen } from "./MarkdownScreen";

const unescapeUrl = (url) => url.replace(/\\([^0-9A-Za-z\s])/g, "$1");

// We add a custom parse function so that we can grab preloaded images locally
const styles = StyleSheet.create({
  heading: {
    borderBottomWidth: 1,
    borderColor: '#000000',
  },
  heading1: {
    fontSize: 32,
    backgroundColor: '#000000',
    color: '#FFFFFF',
  },
  heading2: {
    fontSize: 24,
  },
  heading3: {
    fontSize: 18,
  },
  heading4: {
    fontSize: 16,
  },
  heading5: {
    fontSize: 13,
  },
  heading6: {
    fontSize: 11,
  },
  image: {
    resizeMode: 'contain',
  },
});

export const AboutView = ({ mstyle, children }) => {
  return (
    <View>
      <MarkdownScreen>{children}</MarkdownScreen>
    </View>
  );
};

AboutView.defaultProps = {
  mstyle: {},
  children: undefined,
};

AboutView.propTypes = {
  mstyle: PropTypes.object,
  children: PropTypes.node,
};
