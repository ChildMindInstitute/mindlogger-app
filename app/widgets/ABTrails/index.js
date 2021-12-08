import React from 'react';
import PropTypes from 'prop-types';
import { Text, Container, ListItem, Left, Right, Icon } from 'native-base';
import { Modal, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import TrailsBoard from './TrailsBoard';
import TrailsTutorial from './TrailsTutorial';
import { screens } from './TrailsData';
import { setTutorialStatus } from '../../state/app/app.actions';
import { tutorialStatusSelector } from '../../state/app/app.selectors';
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

class ABTrails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: " ",
      messageColor: '#2e2e2e'
    };
    this.finalAnswer = {};
    this.tutorials = {
      trail1: [
        { text: "There are numbers in circles on this screen." },
        { text: "Please take the pen and draw a line from one number to the next, in order." },
        { text: "Start at 1.", number: 1 },
        { text: "Then go to 2.", number: 2 },
        { text: "Then 3, and so on.", number: 3 },
        { text: "Please try not to lift the pen as you move from one number to the next. Work as quickly as you can.", },
        { text: "Begin here.", number: 1 },
        { text: "And end here.", number: 11 },
      ],
      trail2: [
        { text: "On this screen are more numbers in circles." },
        { text: "Please take the pen and draw a line from one circle to the next, in order." },
        { text: "Start at 1.", number: 1 },
        { text: "And End here.", number: 11 },
        { text: "Please try not to lift the pen as you move from one circle to the next." },
        { text: "Work as quickly as you can." }
      ],
      trail3: [
        { text: "There are numbers and letters in circles on this screen." },
        { text: "Please take the pen and draw a line alternating in order between the numbers and letters." },
        { text: "Start at number 1.", number: 1 },
        { text: "Then go to the first letter, A.", number: 'A' },
        { text: "Then go to the next number, 2.", number: 2 },
        { text: "Then go to the next letter, B, and so on.", number: 'B' },
        { text: "Please try not to lift the pen as you move from one number to the next. Work as quickly as you can." },
        { text: "Begin here.", number: 1 },
        { text: "And end here.", number: 6 },
      ],
      trail4: [
        { text: "On this screen there are more numbers and letters in circles." },
        { text: "Please take the pen and draw a line from one circle to the next." },
        { text: "Alternating in order between the numbers and letters." },
        { text: "Start at 1.", number: 1 },
        { text: "And end here.", number: 6 },
        { text: "Please try not to lift the pen as you move from one circle to the next." },
        { text: "Work as quickly as you can." },
      ],
    };
  }

  componentDidMount() {

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

  onNextTutorial = (text) => {
    this.setState({ message: text ? text : ' ', messageColor: '#2e2e2e' });
  }

  onEndTutorial = () => {
    this.props.setTutorialStatus(2);
  }

  onError = (errorMsg) => {
    this.setState({ message: errorMsg ? errorMsg : ' ', messageColor: 'rgb(230, 50, 50)' });
  }

  render() {
    const { message, messageColor } = this.state;
    const {
      value,
      screen,
      data,
      currentScreen,
      tutorialStatus
    } = this.props;

    this.finalAnswer = data ? data : {};

    return (
      <View style={{ marginBottom: 0, height: 400 }}>
        <View style={{ marginBottom: 10, height: 80, alignItems: "center", justifyContent: 'center' }}>
          <Text style={{ color: messageColor }} fontSize="xs">{message}</Text>
        </View>
        <Container style={styles.paddingContent}>
          {tutorialStatus === 0 ? (
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
          ) : (
              <TrailsTutorial
                currentIndex={this.finalAnswer["value"] && this.finalAnswer["value"].currentIndex}
                tutorial={this.tutorials[screen]}
                currentScreen={currentScreen}
                screen={screens[screen]}
                ref={(ref) => { this.board = ref; }}
                onNext={this.onNextTutorial}
                onEnd={this.onEndTutorial}
              />
          )}
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
  tutorialStatus: PropTypes.number.isRequired,
  setTutorialStatus: PropTypes.func.isRequired,
  data: PropTypes.any,
  screen: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => {
  return {
    tutorialStatus: tutorialStatusSelector(state),
  };
};

const mapDispatchToProps = {
  setTutorialStatus,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ABTrails);
