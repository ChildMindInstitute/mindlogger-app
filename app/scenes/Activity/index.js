import React from 'react';
import { StatusBar, View, StyleSheet, AppState } from 'react-native';
import { Container } from 'native-base';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { Actions } from 'react-native-router-flux';
import { nextScreen, prevScreen } from '../../state/responses/responses.thunks';
import { currentResponsesSelector, itemVisiblitySelector, currentScreenSelector } from '../../state/responses/responses.selectors';
import { currentAppletSelector } from '../../state/app/app.selectors';
import { setAnswer, getResponseInActivity } from '../../state/responses/responses.actions';
import { authTokenSelector } from '../../state/user/user.selectors';
import ActivityScreens from '../../components/ActivityScreens';
import ActHeader from '../../components/header';
import ActProgress from '../../components/progress';
import ActivityButtons from '../../components/ActivityButtons';
import {
  getNextLabel,
  getPrevLabel,
  getActionLabel,
  isNextEnabled,
  isPrevEnabled,
} from '../../services/activityNavigation';

const styles = StyleSheet.create({
  buttonArea: {
    backgroundColor: 'white',
    shadowOpacity: 0.75,
    shadowRadius: 5,
    shadowColor: 'lightgray',
    shadowOffset: { height: 0, width: 0 },
    elevation: 2,
    zIndex: -1,
  },
});

class Activity extends React.Component {
  subscription;

  beforeBackground = new Date();

  state = {
    isContentError: false,
    idleTimer: this.idleTime,
    appState: AppState.currentState,
  };

  componentDidMount() {
    this.subscription = setInterval(this.decreaseTimer, 1000);
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  componentWillUnmount() {
    clearInterval(this.subscription);
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  get currentItem() { return R.path(['items', this.props.currentScreen], this.props.currentResponse.activity); }

  get idleTime() { return (this.props.currentResponse.activity.appletIdleTime || 60) * 60; }

  handleAppStateChange = (nextAppState) => {
    const isInactriveToBackground = this.state.appState === 'inactive' && nextAppState === 'background';
    const isBackgroundToActive = this.state.appState === 'background' && nextAppState === 'active';

    if (isInactriveToBackground) {
      this.beforeBackground = new Date();
    }
    if (isBackgroundToActive) {
      const afterBackground = new Date();
      const dMinutes = Math.round((afterBackground - this.beforeBackground) / 1000);
      this.decreaseTimer(dMinutes);
    }

    this.setState({ appState: nextAppState });
  }


  decreaseTimer = (minutes = 1) => {
    this.setState(
      ({ idleTimer }) => ({ idleTimer: idleTimer - minutes }),
      this.handleTimerChanged,
    );
  };

  resetTimer = () => this.setState({ idleTimer: this.idleTime });

  handleTimerChanged = () => {
    if (this.state.idleTimer <= 0) {
      clearInterval(this.subscription);
      this.props.getResponseInActivity(false);
      Actions.pop();
    }
  }

  render() {
    const {
      currentApplet,
      setAnswer,
      currentResponse,
      authToken,
      currentScreen,
      nextScreen,
      prevScreen,
      itemVisibility,
    } = this.props;
    const { activity, responses } = currentResponse;

    if (!currentResponse) {
      return <View />;
    }

    const fullScreen = this.currentItem.fullScreen || activity.fullScreen;
    const autoAdvance = this.currentItem.autoAdvance || activity.autoAdvance;

    return (
      <Container style={{ flex: 1 }}>
        <StatusBar hidden />
        <ActivityScreens
          activity={activity}
          answers={responses}
          currentScreen={currentScreen}
          onChange={(answer, goToNext = false) => {
            setAnswer(currentApplet.id, activity.id, currentScreen, answer);
            if (goToNext || autoAdvance || fullScreen) {
              nextScreen();
            }
          }}
          authToken={authToken}
          onContentError={() => this.setState({ isContentError: true })}
          onAnyTouch={this.resetTimer}
        />
        {!fullScreen && (
          <View onTouchStart={this.resetTimer} style={styles.buttonArea}>
            {activity.items.length > 1 && (
              <ActProgress index={currentScreen} length={activity.items.length} />
            )}
            <ActivityButtons
              nextLabel={getNextLabel(
                currentScreen,
                itemVisibility,
                activity,
                responses,
                this.state.isContentError,
              )}
              nextEnabled={isNextEnabled(
                currentScreen,
                activity,
                responses,
              )}
              onPressNext={() => {
                this.setState({ isContentError: false });
                nextScreen();
              }}
              prevLabel={getPrevLabel(currentScreen, itemVisibility)}
              prevEnabled={isPrevEnabled(currentScreen, activity)}
              onPressPrev={prevScreen}
              actionLabel={getActionLabel(
                currentScreen,
                responses,
                activity.items,
              )}
              onPressAction={() => {
                setAnswer(currentApplet.id, activity.id, currentScreen, undefined);
              }}
            />
          </View>
        )}
        {!fullScreen && <ActHeader title={activity.name.en} />}
      </Container>
    );
  }
}

Activity.defaultProps = {
  currentResponse: undefined,
  currentScreen: null,
};

Activity.propTypes = {
  currentApplet: PropTypes.object.isRequired,
  currentResponse: PropTypes.object,
  setAnswer: PropTypes.func.isRequired,
  authToken: PropTypes.string.isRequired,
  currentScreen: PropTypes.number,
  nextScreen: PropTypes.func.isRequired,
  prevScreen: PropTypes.func.isRequired,
  itemVisibility: PropTypes.array.isRequired,
  getResponseInActivity: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  currentApplet: currentAppletSelector(state),
  currentResponse: currentResponsesSelector(state),
  authToken: authTokenSelector(state),
  currentScreen: currentScreenSelector(state),
  itemVisibility: itemVisiblitySelector(state),
});

const mapDispatchToProps = {
  getResponseInActivity,
  setAnswer,
  nextScreen,
  prevScreen,
};

export default connect(mapStateToProps, mapDispatchToProps)(Activity);
