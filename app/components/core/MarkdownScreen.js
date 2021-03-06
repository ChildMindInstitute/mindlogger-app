import React, { Component } from "react";
import PropTypes from 'prop-types';
import * as R from 'ramda';
import { View, Linking, Dimensions, Image, Text } from 'react-native';
import { markdownStyle } from '../../themes/activityTheme';
import { VideoPlayer } from './VideoPlayer';
import AudioPlayer from './AudioPlayer';
import Markdown, { MarkdownIt, renderRules, tokensToAST, stringToTokens } from 'react-native-markdown-display';
import Mimoza from 'mimoza';
import markdownContainer from 'markdown-it-container';
import markdownIns from 'markdown-it-ins';

const { width } = Dimensions.get('window');

const markdownItInstance = MarkdownIt({typographer: true})
.use(markdownContainer)
.use(markdownContainer, 'hljs-left') /* align left */
.use(markdownContainer, 'hljs-center')/* align center */
.use(markdownContainer, 'hljs-right')/* align right */
.use(markdownIns);

const rules = {
  image: (node, children, parent, styles, allowedImageHandlers, defaultImageHandler) => {
    const mimeType = Mimoza.getMimeType(node.attributes.src) || "";
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
        <View
          width={width - 20}
          height={250}
        >
          <VideoPlayer
            uri={node.attributes.src}
            key={node.key}
            width={width - 20}
            height={250}
          />
        </View>
      );
    }

    return (<Image
      key={node.key}
      style={{
        resizeMode: "contain",
        height: 200,
        width: width-100
      }}
      source={{
        uri: node.attributes.src
      }}
    />);
  },
  'container_hljs-left': (node, children, parent, styles) => {
    return <View key={node.key}>{children}</View>
  },
  'container_hljs-center': (node, children, parent, styles) => {
    return <View key={node.key}>{children}</View>
  },
  'container_hljs-right': (node, children, parent, styles) => {
    return (<View key={node.key}>{children}</View>);
  },
  'ins': (node, children) => {
    return (<Text key={node.key} style={{ textDecorationLine: 'underline' }}>{children}</Text>)
  },
  paragraph: (node, children, parents, styles) => {
    let type = null;

    for (let i = 0; i < parents.length; i++) {
      if (parents[i].type.includes('container_hljs')) {
        type = parents[i].type;
        break;
      }
    }

    if (type) {
      const style = type.endsWith('right') ? 'flex-end' : type.includes('center') ? 'center' : 'flex-start';
      return <View key={node.key} key={node.key} style={{ justifyContent: style, alignItems: style }}>
        {children}
      </View>
    }

    return renderRules.paragraph(node, children, parents, styles);
  }
}

class MarkdownScreen extends Component {
  shouldComponentUpdate(nextProps, nextState){
    return nextProps.children != this.props.children;
  }

  render() {
    const { mstyle, children } = this.props;

    const {heading1, heading2, heading3, heading4, heading5, heading6, paragraph} = markdownStyle;

    return (
      <View
        style={{ justifyContent: 'center', alignItems: 'center', marginHorizontal: 10}}
      >
        <Markdown
          style={{ heading1, heading2, heading3, heading4, heading5, heading6, paragraph }}
          mergeStyle={ true }
          onLinkPress={(url) => {
            Linking.openURL(url).catch(error => console.warn('An error occurred: ', error));
          }}
          markdownit={
            markdownItInstance
          }
          rules={rules}
        >
          {children.replace(/(!\[.*\]\s*\(.*?) =\d*x\d*(\))/g, '$1$2')}
        </Markdown>
      </View>
    );
  }
}

MarkdownScreen.defaultProps = {
  mstyle: {},
  children: undefined,
};

MarkdownScreen.propTypes = {
  mstyle: PropTypes.object,
  children: PropTypes.node,
};

export { MarkdownScreen };
