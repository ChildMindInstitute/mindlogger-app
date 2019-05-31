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
  componentDidUpdate() {
    const { value } = this.props;
    if (!value.lines || value.lines.length === 0) {
      this.board.reset();
    }
  }

  render() {
    const { config, value, onChange } = this.props;
    return (
      <View>
        <DrawingBoard
          imageSource={config.imageSource.en}
          lines={value && value.lines}
          onResult={onChange}
          ref={(ref) => { this.board = ref; }}
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
};

Drawing.propTypes = {
  config: PropTypes.shape({
    imageSource: PropTypes.string,
  }),
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};
