import React from 'react';
import PropTypes from 'prop-types';
import { Text, Container, ListItem, Left, Right, Icon } from 'native-base';
import { Modal, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import TrailsBoard from './TrailsBoard';
import TrailsTutorial from './TrailsTutorial';
import { screens, tutorials } from './TrailsData';
import { setTutorialStatus, setTrailsTimerId } from '../../state/app/app.actions';
import { tutorialStatusSelector, trailsTimerIdSelector } from '../../state/app/app.selectors';
import { currentResponsesSelector } from "../../state/responses/responses.selectors";
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
      messageColor: '#2e2e2e',
      isFinished: false,
    };
    this.finalAnswer = {};
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { screen, currentScreen } = nextProps;

    if (Number(screen.slice(-1)) !== currentScreen + 1) {
      return false;
    }
    return true;
  }

  onResult = (itemValue, goToNext = false) => {
    const { onChange } = this.props;
    this.finalAnswer["value"] = itemValue;
    onChange(this.finalAnswer, goToNext);
  }

  onPress = () => {

  }

  onRelease = (msg) => {
    this.setState({
      message: msg,
      messageColor: '#2e2e2e',
      isFinished: true,
    });
  }

  onNextTutorial = (text) => {
    this.setState({ message: text ? text : ' ', messageColor: '#2e2e2e' });
  }

  onEndTutorial = () => {
    this.props.setTutorialStatus(2);
    this.setState({ isFinished: false })
  }

  onError = (errorMsg) => {
    this.setState({ 
      message: errorMsg ? errorMsg : ' ', 
      messageColor: 'rgb(230, 50, 50)',
    });

    setTimeout(() => {
      const { isFinished } = this.state;
      if (!isFinished) this.setState({ message: ' ' });
    }, 2000);
  }

  onLayout = (event) => {
    if (this.state.dimensions) return; // layout was already called
    const { width, height, top, left } = event.nativeEvent.layout;

    this.setState({ dimensions: { width, height, top, left } });
  }

  render() {
    const {
      message,
      messageColor,
      dimensions,
      isFinished
    } = this.state;
    const {
      screen,
      data,
      tutorialStatus,
      trailsTimerId,
      setTrailsTimerId,
      currentScreen,
    } = this.props;
    const { activity } = this.props.currentResponse;
    let currentActivity = 'activity1';

    if (activity.name && activity.name.en.includes('v2')) {
      currentActivity = 'activity2';
    }

    this.finalAnswer = data ? data : {};
    const height = dimensions ? dimensions.width + 100 : 400;

    if (
      tutorialStatus === 0 &&
      !isFinished &&
      messageColor === "#2e2e2e" &&
      message !== " "
    ) {
      this.setState({ message: " " })
    }

    return (
      <View
        style={{ marginBottom: 0, height }}
        onLayout={this.onLayout}
      >
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
              currentScreen={currentScreen + 1}
              setTrailsTimerId={setTrailsTimerId}
              trailsTimerId={trailsTimerId}
              screen={screens[currentActivity][screen]}
              onResult={this.onResult}
              ref={(ref) => { this.board = ref; }}
              onError={this.onError}
              onRelease={this.onRelease}
            />
          ) : (
              <TrailsTutorial
                currentIndex={this.finalAnswer["value"] && this.finalAnswer["value"].currentIndex}
                tutorial={tutorials[currentActivity][screen]}
                currentScreen={currentScreen + 1}
                screen={screens[currentActivity][screen]}
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
  setTrailsTimerId: PropTypes.func.isRequired,
  currentResponse: PropTypes.object.isRequired,
  data: PropTypes.any,
  trailsTimerId: PropTypes.number.isRequired,
  screen: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => {
  return {
    tutorialStatus: tutorialStatusSelector(state),
    currentResponse: currentResponsesSelector(state),
    trailsTimerId: trailsTimerIdSelector(state),
  };
};

const mapDispatchToProps = {
  setTutorialStatus,
  setTrailsTimerId,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ABTrails);
