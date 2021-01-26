import React from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import { View, Linking, Dimensions, Text } from 'react-native';
import { markdownStyle } from '../../themes/activityTheme';
import { VideoPlayer } from './VideoPlayer';
import Markdown, { MarkdownIt, stringToTokens, tokensToAST } from 'react-native-markdown-display';
import { html5Media } from 'markdown-it-html5-media';

const { width } = Dimensions.get('window');

const rules = {
  video: (node, children, parent, styles) => {
    return (
      <VideoPlayer
        uri={node.attributes.src}
        key={node.key}
        width={width - 50}
        height={250}
      />
    );
  }
}

export const MarkdownScreen = ({ mstyle, children }) => {
  return (
    <View
      style={{ justifyContent: 'center', alignItems: 'center' }}
    >
      <Markdown
        style={{ ...markdownStyle}}
        mergeStyle={ true }
        onLinkPress={(url) => {
          Linking.openURL(url).catch(error => console.warn('An error occurred: ', error));
        }}
        markdownit={
          MarkdownIt({typographer: true}).use(html5Media)
        }
        rules={rules}
      >
        {children}
      </Markdown>
    </View>
  );
};

MarkdownScreen.defaultProps = {
  mstyle: {},
  children: undefined,
};

MarkdownScreen.propTypes = {
  mstyle: PropTypes.object,
  children: PropTypes.node,
};
