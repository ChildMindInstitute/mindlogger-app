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


  handleComment = (itemValue) => {
    const { onChange } = this.props;
    this.finalAnswer["text"] = itemValue;
    onChange(this.finalAnswer);
  }

  onSelect(v) {
    const { onChange } = this.props;
    onChange({ value: v });
  }

  onResult = (itemValue, goToNext) => {
    const { onChange } = this.props;
    this.finalAnswer["value"] = itemValue;
    onChange(this.finalAnswer, false, goToNext);
  }

  onPress = () => {

  }

  onRelease = () => {

  }

  onError = (errorMsg) => {
    this.setState({ error: errorMsg ? errorMsg : ' ' });

    setTimeout(() => {
      this.setState({ error: ' ' });
    }, 2000)
  }

  render() {
    const { error } = this.state;
    const { value, screen, data, currentScreen } = this.props;

    this.finalAnswer = data ? data : {};

    return (
      <View style={{ marginBottom: 0, height: 350 }}>
        <View style={{ marginBottom: 20, alignItems: "center" }}>
          <Text style={{ color: rgb(230, 50, 50) }} fontSize="xs">{error}</Text>
        </View>
        <Container style={styles.paddingContent}>
          <TrailsBoard
            lines={this.finalAnswer["value"] && this.finalAnswer["value"].lines}
            currentIndex={this.finalAnswer["value"] && this.finalAnswer["value"].currentIndex}
            failedCnt={this.finalAnswer["value"] && this.finalAnswer["value"].failedCnt}
            screenTime={this.finalAnswer["value"] && this.finalAnswer["value"].screenTime}
            currentScreen={currentScreen}
            screen={screens[screen]}
            onResult={this.onResult}
            ref={(ref) => { this.board = ref; }}
            onPress={this.onPress}
            onError={this.onError}
            onRelease={this.onRelease}
          />
        </Container>

      </View>
    );
  }
}

ABTrails.defaultProps = {
  value: undefined,
};

ABTrails.propTypes = {
  onChange: PropTypes.func.isRequired,
  currentScreen: PropTypes.number.isRequired,
  data: PropTypes.any,
  screen: PropTypes.string.isRequired,
};
