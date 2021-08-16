import React, { Component } from "react";
import PropTypes from 'prop-types';
import { View, Linking, Dimensions, Image, Text } from 'react-native';
import { markdownStyle } from '../../themes/activityTheme';
import { VideoPlayer } from './VideoPlayer';
import AudioPlayer from './AudioPlayer';
import Markdown, { MarkdownIt, renderRules, tokensToAST, stringToTokens } from 'react-native-markdown-display';
import Mimoza from 'mimoza';
import markdownContainer from 'markdown-it-container';
import markdownIns from 'markdown-it-ins';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

const markdownItInstance = MarkdownIt({ typographer: true })
  .use(markdownContainer)
  .use(markdownContainer, 'hljs-left') /* align left */
  .use(markdownContainer, 'hljs-center')/* align center */
  .use(markdownContainer, 'hljs-right')/* align right */
  .use(markdownIns);

const regex = new RegExp(/^==(.*==)?/);

class MarkdownScreen extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.children != this.props.children;
  }

  render() {
    let { textColor, children, maxWidth } = this.props;

    if (!maxWidth) {
      maxWidth = width - 20;
    }
    const rules = {
      text: (node, children, parent, styles, inheritedStyles = {}) => {
        const additionalStyling = regex.test(node.content.trim()) ? { backgroundColor: 'yellow' } : {}
        return (
          <Text key={node.key} style={[inheritedStyles, styles.text, additionalStyling]}>
            {checkNodeContent(node.content)}
          </Text>
        )
      },
      image: (node, children, parent, styles, allowedImageHandlers, defaultImageHandler) => {
        const mimeType = Mimoza.getMimeType(node.attributes.src) || "";

        if (mimeType.startsWith('audio/')) {
          return (
            <AudioPlayer
              uri={node.attributes.src}
              key={node.key}
              content={node.content}
              width={maxWidth - 30}
              height={50}
            />
          );
        } else if (mimeType.startsWith('video/') || node.attributes.src.includes('.quicktime')) {
          return (
            <View
              width={ maxWidth }
              height={250}
            >
              <VideoPlayer
                uri={node.attributes.src}
                key={node.key}
                width={maxWidth}
                height={250}
              />
            </View>
          );
        } else if (node.attributes.src.includes('youtu')) {
          let src = node.attributes.src.split(".be/")[1];
          return (
            <View
              width={maxWidth}
              height={250}
            >
              <WebView
                height={250}
                key={node.key}
                width={maxWidth}
                mediaPlaybackRequiresUserAction
                source={{ uri: node.attributes.src.includes('watch?') ? node.attributes.src : `https://www.youtube.com/embed/${src}` }}
              />
            </View>
          );
        }

        return (<Image
          key={node.key}
          style={{
            resizeMode: "contain",
            height: 200,
            width: maxWidth - 80
          }}
          source={{
            uri: node.attributes.src
          }}
        />);
      },
      'container_hljs-left': (node, children, parent, styles) => {
        const style = 'flex-start';

        return <View key={node.key} style={{ justifyContent: style, alignItems: style }}>{children}</View>
      },
      'container_hljs-center': (node, children, parent, styles) => {
        const style = 'center';

        return <View key={node.key} style={{ justifyContent: style, alignItems: style }}>{children}</View>
      },
      'container_hljs-right': (node, children, parent, styles) => {
        const style = 'flex-end';

        return (<View key={node.key} style={{ justifyContent: style, alignItems: style }}>{children}</View>);
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

    if (children.indexOf("404:") > -1) {
      children = '# ¯\\\\_(ツ)_/¯ ' + '\n # \n The authors of this applet have not provided any information!'
    }
    const { heading1, heading2, heading3, heading4, heading5, heading6, paragraph } = markdownStyle;
    let alignment = 'center';

    if (children.includes('::: hljs-right')) {
      alignment = 'flex-end';
    } else if (children.includes('::: hljs-left')) {
      alignment = 'flex-start';
    }

    return (
      <View
        style={{ justifyContent: alignment, alignItems: alignment, marginHorizontal: 10 }}
      >
        <Markdown
          style={{ heading1, heading2, heading3, heading4, heading5, heading6, paragraph, text: { flexDirection: 'row', color: textColor } }}
          mergeStyle={true}
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
  textColor: '#000000',
  children: undefined,
};

MarkdownScreen.propTypes = {
  textColor: PropTypes.string,
  maxWidth: PropTypes.number,
  children: PropTypes.node,
};

export { MarkdownScreen };


const checkNodeContent = (content) => {
  content = content.replace(/(<([^><]+)>)/ig, '');

  if (regex.test(content.trim())) content = content.trim().replace(/==/g, "")
  if (content.indexOf("^") > -1 && content.indexOf('^^') === -1) return checkSuperscript(content)
  if (content.indexOf("~") > -1 && content.indexOf('~~') === -1) return checkSubscript(content)

  return content;
}

const checkSuperscript = (content) => {
  if (content.indexOf("^") > -1 && content.indexOf('^^') === -1) {
    return content.split("^").map((val, i) => {
      if (i % 2 !== 0 && val.length > 0) {
        return <Text style={{ fontSize: 13, lineHeight: 18 }}>{val}</Text>
      } else {
        return checkSubscript(val)
      }
    });
  }
  return content;
}

const checkSubscript = (content) => {
  if (content.indexOf("~") > -1 && content.indexOf('~~') === -1) {
    return content.split("~").map((val, i) => {
      if (i % 2 !== 0 && val.length > 0) {
        return <Text style={{ fontSize: 13, lineHeight: 18, textAlignVertical: "bottom" }}>{val}</Text>
      } else {
        return checkSuperscript(val)
      }
    })
  }
  return content;
}
