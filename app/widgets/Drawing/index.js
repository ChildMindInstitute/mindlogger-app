import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import DrawingBoard from './DrawingBoard';

const styles = StyleSheet.create({
  text: {
    paddingTop: 20,
    paddingBottom: 20,
  },
});

export class Drawing extends React.Component {
  componentDidUpdate(oldProps) {
    const { value } = this.props;
    if (value !== oldProps.value && !value.lines) {
      this.board.reset();
    }
  }

  render() {
    const { config, value, onChange, onPress, onRelease } = this.props;
    return (
      <View>
        <DrawingBoard
          imageSource={config.backgroundImage ? config.backgroundImage.contentUrl.en : null}
          lines={value && value.lines}
          onResult={onChange}
          ref={(ref) => { this.board = ref; }}
          onPress={onPress}
          onRelease={onRelease}
        />
        {config.instruction && (
          <Text style={styles.text}>{config.instruction}</Text>
        )}
      </View>
    );
  }
}

Drawing.defaultProps = {
  config: {},
  value: {},
  onPress: () => {},
  onRelease: () => {},
};

Drawing.propTypes = {
  config: PropTypes.shape({
    imageSource: PropTypes.object,
  }),
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  onPress: PropTypes.func,
  onRelease: PropTypes.func,
};
