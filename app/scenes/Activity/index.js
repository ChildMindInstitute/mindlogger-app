import React from "react";
import { StatusBar, View, Text, StyleSheet, Alert, Image } from "react-native";
import { Container } from "native-base";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import * as R from "ramda";
import _ from "lodash";
import { Actions } from "react-native-router-flux";
import moment from "moment";
import i18n from "i18next";
import {
  nextScreen,
  prevScreen,
  completeResponse,
} from "../../state/responses/responses.thunks";
import {
  currentResponsesSelector,
  itemVisiblitySelector,
  isSummaryScreenSelector,
  currentScreenSelector,
  lastResponseTimeSelector,
} from "../../state/responses/responses.selectors";
import { currentAppletSelector, appStatusSelector } from "../../state/app/app.selectors";
import { testVisibility } from "../../services/visibility";
import {
  setCurrentActivity,
  setActivitySelectionDisabled,
} from "../../state/app/app.actions";
import {
  setAnswer,
  setSummaryScreen,
  setSelected,
} from "../../state/responses/responses.actions";

import { authTokenSelector } from "../../state/user/user.selectors";
import ActivityScreens from "../../components/ActivityScreens";
import ActivityTime from "./ActivityTime";
import ActivitySummary from "../ActivitySummary";
import ActivitySplash from "../ActivitySplash";
import ActHeader from "../../components/header";
import ActProgress from "../../components/progress";
import ActivityButtons from "../../components/ActivityButtons";
import Modal from 'react-native-modal';
import { colors } from "../..//themes/colors";
import {
  getNextPos,
  getNextLabel,
  getPrevLabel,
  getActionLabel,
  isNextEnabled,
  isPrevEnabled,
} from "../../services/activityNavigation";
import Timer from "../../services/timer";

const styles = StyleSheet.create({
  buttonArea: {
    backgroundColor: "white",
    shadowOpacity: 0.75,
    shadowRadius: 5,
    shadowColor: "lightgray",
    shadowOffset: { height: 0, width: 0 },
    elevation: 2,
    zIndex: -1,
  },
  modal: {
    borderRadius: 10,
    padding: 5,
    backgroundColor: 'black',
    opacity: 0.8,
    width: '75%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

const clock = require('../../../img/clock.png');

class Activity extends React.Component {
  constructor() {
    super();
    this.state = {
      isContentError: false,
      idleTime: null,
      isSummaryScreen: false,
      isSplashScreen: false,
      modalVisible: false
    };
    this.idleTimer = new Timer();
  }

  componentDidMount() {
    const { isSummaryScreen, currentResponse: { activity }, currentScreen } = this.props;
    const idleTime = this.getIdleTime();

    this.props.setActivitySelectionDisabled(false);
    this.setState({
      isSummaryScreen,
      idleTime,
      isSplashScreen: activity.splash && activity.splash.en && currentScreen === 0
    }, () => {
      if (idleTime) {
        this.idleTimer.startCountdown(
          idleTime, // Time in seconds.
          this.handleTimeIsUp // Callback.
        );
      }
    });
  }

  componentDidUpdate() {
    if (!this.props.currentResponse) {
      this.idleTimer.clear();
    }
  }

  handleChange(answer, goToNext=false, timeElapsed=0) {
    const { isSummaryScreen } = this.state;
    const {
      currentApplet,
      currentResponse,
      currentScreen,
      nextScreen,
      isSelected,
      setSummaryScreen,
      setSelected,
      lastResponseTime
    } = this.props;
    const { activity, responses } = currentResponse;
    const fullScreen = this.currentItem.fullScreen || activity.fullScreen;
    const autoAdvance = this.currentItem.autoAdvance || activity.autoAdvance;
    const optionalText = this.currentItem.isOptionalText;
    const responseTimes = {};

    responses[currentScreen] = answer;

    for (const activity of currentApplet.activities) {
      responseTimes[activity.name.en.replace(/\s/g, '_')] = (lastResponseTime[currentApplet.id] || {})[activity.id];
    }

    const visibility = activity.items.map((item) => {
      if (item.isvis) {
        return false;
      }
      return testVisibility(item.visibility, activity.items, responses, responseTimes)
    });
    const next = getNextPos(currentScreen, visibility);

    if (!goToNext && (this.currentItem.inputType === 'stackedRadio' || this.currentItem.inputType == 'stackedSlider')) {
      return;
    }

    if ((autoAdvance || fullScreen) && !optionalText || goToNext) {
      if (next === -1 && activity.compute && !activity.summaryDisabled && !isSummaryScreen) {
        this.setState({ isSummaryScreen: true });
        setSummaryScreen(true);
      } else {
        if (isSummaryScreen) {
          this.setState({ isSummaryScreen: false });
        }
        nextScreen(timeElapsed);
        setSelected(false);
      }
    }
  }

  get currentItem() {
    return R.path(
      ["items", this.props.currentScreen],
      this.props.currentResponse.activity
    );
  }

  getIdleTime = () => {
    const { activity } = this.props.currentResponse;
    let currentEvent = activity.event;

    if (currentEvent) {
      const allow = _.get(currentEvent, "data.idleTime.allow", false);
      if (allow) {
        const idleMinutes = _.get(currentEvent, "data.idleTime.minute", null);
        return idleMinutes && parseInt(idleMinutes, 10) * 60;
      }
    }
    return null;
  };

  handleTimeIsUp = () => {
    if (this.props.currentResponse) {
      this.props.completeResponse(true);
      Actions.replace("activity_thanks")
    }
  }

  handlePressPrevScreen = () => {
    const { isSummaryScreen } = this.state;
    const {
      setSummaryScreen,
      setCurrentActivity,
      currentScreen,
      prevScreen,
      setSelected,
      isSelected,
    } = this.props;

    if (isSummaryScreen) {
      this.setState({ isSummaryScreen: false });
      setSummaryScreen(false);
      setSelected(false);
    } else {
      if (!currentScreen) {
        setCurrentActivity(null);
      }
      prevScreen();
      if (isSelected) {
        setSelected(false);
      }
    }
  }

  handlePressNextScreen = () => {
    const {
      currentResponse,
      setSummaryScreen,
      currentScreen,
      nextScreen,
      setSelected,
      itemVisibility,
    } = this.props;

    const { isSummaryScreen, isSplashScreen } = this.state;
    const { activity, responses } = currentResponse;

    if (isSplashScreen) {
      this.setState({ isSplashScreen: false })
      return
    }
    if (
      activity.items[currentScreen].correctAnswer &&
      activity.items[currentScreen].correctAnswer["en"]
    ) {
      const correctAnswer =
        activity.items[currentScreen].correctAnswer["en"];
      if (responses[currentScreen] !== correctAnswer) {
        Alert.alert(
          i18n.t("activity:failed"),
          i18n.t("activity:incorrect_answer"),
          [
            {
              text: "OK",
              onPress: () => console.log("Incorrect!"),
            },
          ]
        );
        return;
      }
    }
    this.setState({ isContentError: false });
    if (
      getNextPos(currentScreen, itemVisibility) === -1 &&
      activity.compute &&
      !activity.summaryDisabled &&
      !isSummaryScreen
    ) {
      this.setState({ isSummaryScreen: true });
      setSummaryScreen(true);
    } else {
      if (isSummaryScreen) {
        this.setState({ isSummaryScreen: false });
        setSummaryScreen(false);
      }
      nextScreen();
      setSelected(false);
    }
  }

  componentWillUnmount() {
    this.idleTimer.clear();
  }

  render() {
    const {
      setAnswer,
      currentResponse,
      currentApplet,
      authToken,
      currentScreen,
      itemVisibility,
      appStatus,
    } = this.props;

    const { isSummaryScreen, isSplashScreen, modalVisible } = this.state;

    const timerEnabled = this.currentItem.inputType == 'futureBehaviorTracker';

    if (!currentResponse) {
      return <View />;
    }

    const { activity, responses } = currentResponse;
    const { removeUndoOption } = this.currentItem.valueConstraints;
    const { topNavigation } = this.currentItem.valueConstraints;
    const fullScreen = (this.currentItem && this.currentItem.fullScreen) || activity.fullScreen;
    const nextLabel = isSummaryScreen
      ? "Next"
      : getNextLabel(
        currentScreen,
        itemVisibility,
        activity,
        responses,
        this.state.isContentError
      );
    const actionLabel = (isSummaryScreen || removeUndoOption)
      ? ""
      : getActionLabel(currentScreen, responses, activity.items);
    let prevLabel = isSummaryScreen
      ? "Back"
      : getPrevLabel(currentScreen, itemVisibility);

    if (this.currentItem.valueConstraints
      && this.currentItem.valueConstraints.removeBackOption) {
      prevLabel = "";
    }

    return (
      <Container style={{ flex: 1 }}>
        <StatusBar hidden />
        {!fullScreen && topNavigation &&
          <ActHeader
            title={activity.name.en}
            actionLabel={actionLabel}
            watermark={currentApplet.watermark}
            prevLabel={prevLabel}
            topNavigation={topNavigation}
            prevEnabled={!isSummaryScreen && isPrevEnabled(currentScreen, activity)}
            onPressPrevScreen={this.handlePressPrevScreen}
            nextEnabled={isNextEnabled(currentScreen, activity, responses)}
            onPressNextScreen={this.handlePressNextScreen}
            onPressAction={() => {
              setAnswer(activity, currentScreen, undefined);
            }}
          />
        }
        {(activity.event && activity.event.data.timedActivity.allow) &&
          <ActivityTime activity={activity} />
        }
        {!isSummaryScreen && !isSplashScreen && (
          <ActivityScreens
            activity={activity}
            answers={responses}
            currentScreen={currentScreen}
            onChange={(answer, goToNext=false, timeElapsed=0) => {
              setAnswer(activity, currentScreen, answer);
              this.handleChange(answer, goToNext, timeElapsed);
            }}
            authToken={authToken}
            onContentError={() => this.setState({ isContentError: true })}
            onAnyTouch={this.idleTimer.resetCountdown}
          />
        )}
        {!!isSummaryScreen && (
          <ActivitySummary responses={responses} activity={activity} />
        )}
        {!!isSplashScreen && (
          <ActivitySplash activity={activity} />
        )}
        {!fullScreen && !topNavigation &&
          <ActHeader
            title={activity.name.en}
            actionLabel={actionLabel}
            watermark={currentApplet.watermark}
            topNavigation={topNavigation}
            prevEnabled={!isSummaryScreen && isPrevEnabled(currentScreen, activity)}
            onPressPrevScreen={this.handlePressPrevScreen}
            nextEnabled={isNextEnabled(currentScreen, activity, responses)}
            onPressNextScreen={this.handlePressNextScreen}
            onPressAction={() => {
              setAnswer(activity, currentScreen, undefined);
            }}
          />
        }
        {!fullScreen && (
          <View
            onTouchStart={this.idleTimer.resetCountdown}
            style={styles.buttonArea}
          >
            {
              !timerEnabled && activity.items.length > 1 && (
                <ActProgress
                  index={currentScreen}
                  length={activity.items.length}
                />
              )
            }
            {!topNavigation &&
              <ActivityButtons
                nextLabel={nextLabel}
                nextEnabled={isSplashScreen || isNextEnabled(currentScreen, activity, responses)}
                onPressNext={() => this.handlePressNextScreen()}
                prevLabel={prevLabel}
                prevEnabled={!isSummaryScreen && isPrevEnabled(currentScreen, activity)}
                onPressPrev={() => this.handlePressPrevScreen()}
                actionLabel={actionLabel}
                timerEnabled={timerEnabled}
                timeLeft={timerEnabled && responses[currentScreen].timeLeft || -1}
                timeLimit={timerEnabled && responses[currentScreen].timeLimit || 0}
                appStatus={appStatus}
                setTimerStatus={(timerActive, timeLeft) => {
                  const response = responses[currentScreen] || {};

                  setAnswer(activity, currentScreen, {
                    value: response.value,
                    timerActive,
                    timeLeft,
                    timeLimit: response.timeLimit
                  })
                }}
                onPressAction={() => {
                  setAnswer(activity, currentScreen, undefined);
                }}
              />
            }

          </View>
        )}

        <Modal
          isVisible={modalVisible}
          onBackdropPress={() => this.setState({ modalVisible: false })}
          backdropOpacity={0}
        >
          <View style={styles.modal}>
            <Image
              source={ clock }
            />
            <Text style={{ color: 'white', fontSize: 25, marginLeft: 10 }}>Time's up!</Text>
          </View>
        </Modal>
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
  setSelected: PropTypes.func.isRequired,
  nextScreen: PropTypes.func.isRequired,
  prevScreen: PropTypes.func.isRequired,
  completeResponse: PropTypes.func.isRequired,
  itemVisibility: PropTypes.array.isRequired,
  setCurrentActivity: PropTypes.func.isRequired,
  setActivitySelectionDisabled: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  currentApplet: currentAppletSelector(state),
  currentResponse: currentResponsesSelector(state),
  authToken: authTokenSelector(state),
  currentScreen: currentScreenSelector(state),
  itemVisibility: itemVisiblitySelector(state),
  isSummaryScreen: isSummaryScreenSelector(state),
  lastResponseTime: lastResponseTimeSelector(state),
  isSelected: state.responses.isSelected,
  appStatus: appStatusSelector(state),
});

const mapDispatchToProps = {
  setCurrentActivity,
  setAnswer,
  setSelected,
  nextScreen,
  prevScreen,
  completeResponse,
  setSummaryScreen,
  setActivitySelectionDisabled,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Activity);
