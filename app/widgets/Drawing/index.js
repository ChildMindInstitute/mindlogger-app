import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import DrawingBoard from './DrawingBoard';
import { Item , Input } from 'native-base';
import { getURL } from '../../services/helper';

const styles = StyleSheet.create({
  text: {
    paddingTop: 20,
    paddingBottom: 20,
  },
});

export class Drawing extends React.Component {
  componentDidUpdate(oldProps) {
    const { answer } = this.props;

    if (!answer && (oldProps.answer && oldProps.answer.value.lines)) {
      this.board.reset();
    }
  }

  finalAnswer = {};

  handleComment = (itemValue) => {
    const {onChange} = this.props;
    this.finalAnswer["text"] = itemValue;
    
  onChange(this.finalAnswer);
  }

  onResult = (itemValue) => {
    const {onChange} = this.props;
    this.finalAnswer["value"] = itemValue;
    onChange(this.finalAnswer);
  }

  render() {
    const { config, answer, onChange, onPress, onRelease  ,isOptionalText} = this.props;
    const url = config.backgroundImage
      ? getURL(config.backgroundImage)
      : null;

    this.finalAnswer = answer ? answer : {};

    return (
      <View>
        <DrawingBoard
          imageSource={url}
          lines={this.finalAnswer["value"] && this.finalAnswer["value"].lines}
          onResult={this.onResult}
          ref={(ref) => { this.board = ref; }}
          onPress={onPress}
          onRelease={onRelease}
        />
        {config.instruction && (
          <Text style={styles.text}>{config.instruction}</Text>
        )}

        {isOptionalText ? 
      (<View    style={{
                    marginTop: '8%' ,
                    justifyContent: 'center',
                  }}
                  >
      <Item bordered>
      <Input 
          placeholder = "Please enter the text"
          onChangeText={text=>this.handleComment(text)}
          value={this.finalAnswer["text"]}
      />
      </Item> 
    </View>
    ):<View></View>
      }
      </View>
    );
  }
}

Drawing.defaultProps = {
  config: {},
  onPress: () => {},
  onRelease: () => {},
};

Drawing.propTypes = {
  config: PropTypes.shape({
    backgroundImage: PropTypes.string,
    instruction: PropTypes.any,
  }),
  answer: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  onPress: PropTypes.func,
  onRelease: PropTypes.func,
};

