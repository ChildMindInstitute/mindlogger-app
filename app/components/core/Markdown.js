import React from 'react';
import * as R from 'ramda';
import { View } from 'react-native';
import { MarkdownView } from 'react-native-markdown-view';
import { markdownStyle } from '../../themes/activityTheme';
import { getURL } from '../../services/helper';

const unescapeUrl = url => url.replace(/\\([^0-9A-Za-z\s])/g, '$1');

// We add a custom parse function so that we can grab preloaded images locally
const rules = {
  image: {
    parse: capture => ({
      alt: capture[1],
      target: getURL(unescapeUrl(capture[2])),
      title: capture[3],
      width: capture[4] ? parseInt(capture[4], 10) : undefined,
      height: capture[5] ? parseInt(capture[5], 10) : undefined,
    }),
  },
};

export const Markdown = ({ mstyle, children }) => (
  <View style={{ alignContent: 'center', alignItems: 'center' }}>
    <MarkdownView
      styles={R.merge(markdownStyle, mstyle)}
      rules={rules}
    >
      {children}
    </MarkdownView>
  </View>
);
