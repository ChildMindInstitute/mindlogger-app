import React from 'react';
import PropTypes from 'prop-types';
import { Text, Container, ListItem, Left, Right, Icon } from 'native-base';
import { Modal, StyleSheet, View } from 'react-native';
import TrailsBoard from './TrailsBoard';
import { screens } from './TrailsData';
import i18n from 'i18next';

import { colors } from '../../theme';

const styles = StyleSheet.create({
  paddingContent: {
    justifyContent: 'center',
  },
  dropDown: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1.5,
    borderBottomColor: colors.lightGrey,
    color: 'white',
  },
  buttonStyle: {
    fontSize: 13,
    width: '100%',
    backgroundColor: 'transparent',
    borderBottomWidth: 1.5,
    borderBottomColor: colors.grey,
    color: colors.grey,
  },
  label: {
    fontSize: 13,
    color: colors.grey,
  },
});

export class ABTrails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: " ",
    };
    this.finalAnswer = {};
  }

  componentDidMount() {
    console.log('data', this.props.data);
  }

  handleComment = (itemValue) => {
    const { onChange } = this.props;
    this.finalAnswer["text"] = itemValue;
    onChange(this.finalAnswer);
  }

  onSelect(v) {
    const { onChange } = this.props;
    onChange({ value: v });
  }

  onResult = (itemValue) => {
    const { onChange } = this.props;
    this.finalAnswer["value"] = itemValue;
    onChange(this.finalAnswer);
  }

  onPress = () => {

  }

  onRelease = () => {

  }

  onError = (errorMsg) => {
    this.setState({ error: errorMsg ? errorMsg : ' ' });
  }

  render() {
    const { error } = this.state;
    const { onChange, value, screen, data } = this.props;

    console.log('screens-----------', screens)

    this.finalAnswer = data ? data : {};

    return (
      <View style={{ marginBottom: 0, height: 350 }}>
        <Container style={styles.paddingContent}>
          <TrailsBoard
            lines={this.finalAnswer["value"] && this.finalAnswer["value"].lines}
            currentIndex={this.finalAnswer["value"] && this.finalAnswer["value"].currentIndex}
            screen={screens[screen]}
            onResult={this.onResult}
            ref={(ref) => { this.board = ref; }}
            onPress={this.onPress}
            onError={this.onError}
            onRelease={this.onRelease}
          />
        </Container>

        <View style={{ marginTop: 20, alignItems: "center" }}>
          <Text fontSize="xs">{error}</Text>
          
        </View>
      </View>
    );
  }
}

ABTrails.defaultProps = {
  value: undefined,
};

ABTrails.propTypes = {
  onChange: PropTypes.func.isRequired,
  data: PropTypes.any,
  screen: PropTypes.string.isRequired,
};
