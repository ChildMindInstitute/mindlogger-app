import React from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import { View, Linking, Dimensions, Image } from 'react-native';
import { markdownStyle } from '../../themes/activityTheme';
import { VideoPlayer } from './VideoPlayer';
import AudioPlayer from './AudioPlayer';
import Markdown from 'react-native-markdown-display';
import Mimoza from 'mimoza';

const { width } = Dimensions.get('window');

const rules = {
  image: (node, children, parent, styles, allowedImageHandlers, defaultImageHandler) => {
    const mimeType = Mimoza.getMimeType(node.attributes.src);
    if (mimeType.startsWith('audio/')) {
      return (
        <AudioPlayer
          uri={node.attributes.src}
          key={node.key}
          content={node.content}
          width={width - 50}
          height={50}
        />
      );
    } else if (mimeType.startsWith('video/')) {
      return (
        <VideoPlayer
          uri={node.attributes.src}
          key={node.key}
          width={width}
          height={250}
        />
      );
    }

    return (<Image
      style={{
        resizeMode: "center",
        height: 200,
        width: width-50
      }}
      source={{
        uri: node.attributes.src
      }}
    />);
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
