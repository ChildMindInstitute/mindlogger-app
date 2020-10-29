import React from "react";
import PropTypes from "prop-types";
import * as R from "ramda";
import { View, Linking } from "react-native";
import Markdown, { getUniqueID } from "react-native-markdown-renderer";
import { getURL } from "../../services/helper";
import { StyleSheet } from 'react-native';

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

const rules = {
  heading1: (node, children, parent, styles) =>
    <Text key={getUniqueID()} style={[styles.heading, styles.heading1]}>
      [{children}]
      </Text>,
  heading2: (node, children, parent, styles) =>
    <Text key={getUniqueID()} style={[styles.heading, styles.heading2]}>
      [{children}]
      </Text>,
  heading3: (node, children, parent, styles) =>
    <Text key={getUniqueID()} style={[styles.heading, styles.heading3]}>
      [{children}]
      </Text>,
  image: (node, children, parent, styles) =>
    <Text key={getUniqueID()} style={[styles.heading, styles.image]}>
      [{children}]
      <br />
      </Text>,
};

const rules1 = {
  image: {
    parse: (capture) => ({
      alt: capture[1],
      target: getURL(unescapeUrl(capture[2])),
      title: capture[3],
      width: capture[4] ? parseInt(capture[4], 10) : undefined,
      height: capture[5] ? parseInt(capture[5], 10) : undefined,
    }),
  },
};

export const AboutView = ({ mstyle, children }) => {
  return (
    <View>
      <Markdown
        style={styles }
      >
        {children}
      </Markdown>
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
