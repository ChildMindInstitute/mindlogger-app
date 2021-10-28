import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, Image, ScrollView, KeyboardAvoidingView, TextInput, Platform } from 'react-native';
import DrawingBoard from './DrawingBoard';
import { Item, Input } from 'native-base';
import { getURL } from '../../services/helper';
import { OptionalText } from '../OptionalText';

const styles = StyleSheet.create({
  text: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  imgContainer: {
    padding: 20,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  img: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
});

export class Drawing extends React.Component {
  componentDidUpdate(oldProps) {
    const { answer } = this.props;

    if (!answer && (oldProps.answer && oldProps.answer?.value?.lines)) {
      this.board.reset();
    }
  }

  finalAnswer = {};

  handleComment = (itemValue) => {
    const { onChange } = this.props;
    this.finalAnswer["text"] = itemValue;

    onChange(this.finalAnswer);
  }

  onResult = (itemValue) => {
    const { onChange } = this.props;
    this.finalAnswer["value"] = itemValue;
    onChange(this.finalAnswer);
  }

  render() {
    const { config, answer, onChange, onPress, onRelease, isOptionalText, isOptionalTextRequired } = this.props;
    const url = config.inputs.backgroundImage
      ? getURL(config.inputs.backgroundImage)
      : null;

    this.finalAnswer = answer ? answer : {};

    return (
      <KeyboardAvoidingView
      // behavior="padding"
      >
        <View>
          {
            config?.valueConstraints?.image ? (
              <View style={styles.imgContainer}>
                <Image
                  style={styles.img}
                  source={{
                    uri: config.valueConstraints.image,
                  }}
                />
              </View>) : <View></View>
          }
          <DrawingBoard
            imageSource={url}
            lines={this.finalAnswer["value"] && this.finalAnswer["value"].lines}
            onResult={this.onResult}
            ref={(ref) => { this.board = ref; }}
            onPress={onPress}
            onRelease={onRelease}
          />
          {config.inputs.instruction && (
            <Text style={styles.text}>{config.inputs.instruction}</Text>
          )}
          {isOptionalText &&
            <OptionalText
              onChangeText={text => this.handleComment(text)}
              value={this.finalAnswer["text"]}
              isRequired={isOptionalTextRequired}
            />
          }
        </View>
      </KeyboardAvoidingView>
    );
  }
}

Drawing.defaultProps = {
  config: {},
  onPress: () => { },
  onRelease: () => { },
};

Drawing.propTypes = {
  config: PropTypes.shape({
    inputs: PropTypes.object,
    valueConstraints: PropTypes.object,
  }),
  answer: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  onPress: PropTypes.func,
  onRelease: PropTypes.func,
};

