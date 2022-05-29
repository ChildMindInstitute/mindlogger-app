import React from "react";
import { StatusBar, View, Text, StyleSheet, Alert, Image } from "react-native";
import { Container } from "native-base";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import * as R from "ramda";
import _ from "lodash";
import { Actions } from "react-native-router-flux";
import i18n from "i18next";
import { addUserActivityEvents } from "../../state/responses/responses.actions";
import {
  nextScreen,
  prevScreen,
  completeResponse,
  finishActivity
} from "../../state/responses/responses.thunks";
import {
  currentResponsesSelector,
  itemVisiblitySelector,
  isSummaryScreenSelector,
  isSplashScreenSelector,
  currentScreenSelector,
  lastResponseTimeSelector,
} from "../../state/responses/responses.selectors";
import { tutorials } from '../../widgets/ABTrails/TrailsData';
import {
  currentAppletSelector,
  appStatusSelector,
  tutorialStatusSelector,
  tutorialIndexSelector,
} from "../../state/app/app.selectors";
import { setTutorialStatus, setTutorialIndex } from '../../state/app/app.actions';
import { testVisibility } from "../../services/visibility";
import {
  setCurrentActivity,
} from "../../state/app/app.actions";
import {
  setAnswer,
  setSummaryScreen,
  setSplashScreen,
  setSelected,
  setCurrentScreen,
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
import { sendData } from "../../services/socket";

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
    backgroundColor: 'grey',
    opacity: 0.9,
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
      isActivityShow: false,
      modalVisible: false,
      hasSplashScreen: false,
      responses: [],
      visibility: [],
      optionalTextChanged: false
    };
    this.userEvents = [];
    this.idleTimer = new Timer();
    this.completed = false;
  }

  componentDidMount() {
    const { isSummaryScreen, currentResponse, currentScreen, itemVisibility } = this.props;
    const { activity, responses } = currentResponse;

    const idleTime = this.getIdleTime();

    this.setState({
      isSummaryScreen,
      idleTime,
      hasSplashScreen: activity.splash && activity.splash.en && currentScreen === 0 && !isSummaryScreen,
      responses,
      visibility: itemVisibility
    }, () => {
      if (idleTime) {
        this.idleTimer.startCountdown(
          idleTime, // Time in seconds.
          this.handleTimeIsUp // Callback.
        );
      }
      this.setState({
        isActivityShow: true
      })
    });
  }

  componentDidUpdate(oldProps) {
    if (!this.props.currentResponse) {
      this.idleTimer.clear();
    }
    if (oldProps.appStatus != this.props.appStatus && oldProps.appStatus == true) {
      this.updateStore();
    }

    if (oldProps.currentScreen != this.props.currentScreen) {
      this.completed = false;
    }

    if (
      this.props.currentResponse &&
      oldProps.currentResponse.responses != this.props.currentResponse.responses
    ) {
      this.setState({ responses: this.props.currentResponse.responses })
    }
  }

  handleChange(responses, goToNext=false, timeElapsed=0) {
    const { isSummaryScreen } = this.state;
    const {
      currentResponse,
      currentScreen,
      nextScreen,
      setTutorialStatus,
      setSummaryScreen,
      setSelected,
      currentApplet,
      lastResponseTime,
    } = this.props;
    const { activity } = currentResponse;
    const fullScreen = this.currentItem.fullScreen || activity.fullScreen;
    const autoAdvance = this.currentItem.autoAdvance || activity.autoAdvance;
    const optionalText = this.currentItem.isOptionalText;
    const responseTimes = {};

    for (const activity of currentApplet.activities) {
      responseTimes[activity.name.en.replace(/\s/g, '_')] = (lastResponseTime[currentApplet.id] || {})[activity.id];
    }

    const visibility = activity.items.map((item) => {
      if (item.isVis) {
        return false;
      }
      return testVisibility(item.visibility, activity.items, responses, responseTimes)
    });
    const next = getNextPos(currentScreen, visibility);

    this.setState({ visibility });

    if (!goToNext || !timeElapsed) {
      const userEvent = {
        type: 'SET_ANSWER',
        time: Date.now(),
        screen: currentScreen
      };

      const inputType = activity.items[currentScreen].inputType;
      if (responses[currentScreen]) {
        if ([
          'radio', 'stackedRadio', 'slider', 'stackedSlider', 'timeRange', 'duration',
          'date', 'ageSelector', 'select', 'text', 'time', 'geolocation',
          'pastBehaviorTracker', 'futureBehaviorTracker', 'dropdownList'
        ].indexOf(inputType) >= 0) {
          userEvent.response = JSON.parse(JSON.stringify(responses[currentScreen]));
        } else if (typeof responses[currentScreen] == 'object' && responses[currentScreen].text) {
          userEvent.response = { text: responses[currentScreen].text };
        }
      }

      if (this.userEvents.length > 0) {
        const lastEvent = this.userEvents[this.userEvents.length-1];

        if ((inputType == 'trail' || inputType == 'drawing' || inputType == 'text') && lastEvent.type == 'SET_ANSWER') {
          this.userEvents.pop();
        } else if (
          userEvent.response && lastEvent.response && typeof lastEvent.response == 'object' && typeof userEvent.response == 'object'
        ) {
          if (lastEvent.response.text != userEvent.response.text) {
            if (this.state.optionalTextChanged) {
              this.userEvents.pop();
            }

            this.setState({ optionalTextChanged: true });
          } else {
            this.setState({ optionalTextChanged: false });
          }
        }

        if (inputType == 'trail' && responses[currentScreen] && !responses[currentScreen].value.updated) {
          userEvent.time = lastEvent.time;
        }
      }

      this.userEvents.push(userEvent);
    }

    if (!goToNext && (this.currentItem.inputType === 'stackedRadio' || this.currentItem.inputType == 'stackedSlider')) {
      return;
    }

    if ((autoAdvance || fullScreen) && !optionalText || goToNext) {
      if (!this.completed) {
        this.updateStore();
      }

      if (next === -1 && activity.compute && !activity.summaryDisabled && !isSummaryScreen) {
        this.setState({ isSummaryScreen: true });
        setSummaryScreen(activity, true);
      } else {
        if (isSummaryScreen) {
          this.setState({ isSummaryScreen: false });
        }
        if (activity.items[currentScreen].inputType === "trail") {
          setTutorialStatus(1);
        }

        nextScreen(timeElapsed);
        setSelected(false);
      }
    }
  }

  findActivity = (name, activities = []) => {
    if (!name) return undefined;
    return _.find(activities, { name: { en: name } });
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
      this.updateStore();
      this.props.completeResponse(true);

      sendData(
        'finish_activity',
        this.props.currentResponse.activity.id,
        this.props.currentApplet.id
      );

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
      currentResponse,
    } = this.props;
    const { activity, responses } = currentResponse;

    this.userEvents.push({
      type: 'PREV',
      time: Date.now(),
      screen: currentScreen
    });

    this.setState({ optionalTextChanged: false });

    this.updateStore();

    if (isSummaryScreen) {
      this.setState({ isSummaryScreen: false });
      setSummaryScreen(activity, false);
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

  handlePressNextScreen = (nextLabel = null) => {
    const {
      currentResponse,
      setSummaryScreen,
      setTutorialStatus,
      setTutorialIndex,
      tutorialStatus,
      tutorialIndex,
      currentScreen,
      nextScreen,
      setSelected,
      itemVisibility,
      setSplashScreen,
      setCurrentScreen,
      isSplashScreen,
    } = this.props;

    const { isSummaryScreen } = this.state;
    const { activity } = currentResponse;
    const screen = activity.items[currentScreen].variableName;
    let currentActivity = 'activity1';
    const next = getNextPos(currentScreen, itemVisibility);

    if (activity.name && activity.name.en.includes('iPad')) {
      currentActivity = 'activity2';
    }
    if (activity.items[currentScreen].inputType === "trail") {
      if (tutorialStatus !== 0) {
        if (tutorialIndex + 1 < tutorials[currentActivity][screen].length) {
          setTutorialIndex(tutorialIndex + 1);
        } else {
          setTutorialStatus(0);
          setTutorialIndex(0);
        }
        this.userEvents.push({
          type: 'NEXT',
          time: Date.now(),
          screen: currentScreen
        });
        this.updateStore();
        return;
      } else if (currentScreen !== 3) {
        setTutorialStatus(1);
      }
    }

    let eventType = 'NEXT';
    if (nextLabel == i18n.t('activity_navigation:skip')) {
      eventType = 'SKIP';
    } else if (nextLabel == i18n.t('activity_navigation:done')) {
      eventType = 'DONE';
    }

    this.userEvents.push({
      type: eventType,
      time: Date.now(),
      screen: isSummaryScreen ? 'summary' : currentScreen
    });

    this.setState({ optionalTextChanged: false });

    if (!this.completed) {
      this.updateStore();
    }

    if (isSplashScreen) {
      setSplashScreen(activity, false);
      setCurrentScreen(activity.event ? activity.id + activity.event.id : activity.id, currentScreen)
      return
    }
    if (
      activity.items[currentScreen].correctAnswer &&
      activity.items[currentScreen].correctAnswer["en"]
    ) {
      const correctAnswer = activity.items[currentScreen].correctAnswer["en"];
      if (this.state.responses[currentScreen] !== correctAnswer) {
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
      next === -1 &&
      activity.compute &&
      !activity.summaryDisabled &&
      !isSummaryScreen
    ) {
      this.setState({ isSummaryScreen: true });
      setSummaryScreen(activity, true);
    } else {
      if (isSummaryScreen) {
        this.setState({ isSummaryScreen: false });
        setSummaryScreen(activity, false);
      }

      if (!this.completed) {
        if (next == -1) {
          this.completed = true;
        }
        nextScreen();

        setSelected(false);
      }
    }
  }

  updateStore () {
    const { currentScreen, addUserActivityEvents } = this.props;
    if (!this.props.currentResponse) return;

    const activity = this.props.currentResponse.activity;
    this.props.setAnswer(
      activity,
      currentScreen,
      this.state.responses[currentScreen]
    );

    if (this.userEvents.length) {
      addUserActivityEvents(activity, this.userEvents);
      this.userEvents = [];
    }
  }

  componentWillUnmount() {
    this.updateStore();
    this.idleTimer.clear();
    this.props.setTutorialStatus(1);
    this.props.setTutorialIndex(0);
  }

  render() {
    const {
      setAnswer,
      currentResponse,
      tutorialStatus,
      currentApplet,
      authToken,
      currentScreen,
      appStatus,
      isSplashScreen,
    } = this.props;

    const { visibility, isSummaryScreen, isActivityShow, hasSplashScreen, modalVisible } = this.state;

    if (!currentResponse || !this.currentItem) {
      return <View />;
    }

    const timerEnabled = this.currentItem.inputType == 'futureBehaviorTracker';

    const { activity } = currentResponse;
    const { responses } = this.state;

    const { removeUndoOption } = this.currentItem.valueConstraints;
    const { topNavigation } = this.currentItem.valueConstraints;
    const fullScreen = (this.currentItem && this.currentItem.fullScreen) || activity.fullScreen;
    const nextLabel = isSummaryScreen
      ? i18n.t('activity_navigation:done')
      : getNextLabel(
        currentScreen,
        isSplashScreen,
        visibility,
        activity,
        responses,
        this.state.isContentError,
        tutorialStatus
      );
    const actionLabel = (isSummaryScreen || removeUndoOption)
      ? ""
      : getActionLabel(currentScreen, responses, activity.items);
    let prevLabel = isSummaryScreen
      ? "Back"
      : getPrevLabel(currentScreen, visibility);

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
            isSummaryScreen={isSummaryScreen}
            prevLabel={prevLabel}
            topNavigation={topNavigation}
            prevEnabled={!isSummaryScreen && isPrevEnabled(currentScreen, activity)}
            onPressPrevScreen={this.handlePressPrevScreen}
            nextEnabled={isNextEnabled(currentScreen, activity, responses)}
            onPressNextScreen={this.handlePressNextScreen}
            onPressAction={() => {
              responses[currentScreen] = undefined;
              this.setState({ responses });

              this.userEvents.push({
                type: 'UNDO',
                time: Date.now(),
                screen: currentScreen
              })

              sendData('set_response', { [activity.items[currentScreen].id]: undefined }, currentApplet.id);
            }}
          />
        }
        {(activity.event && activity.event.data.timedActivity.allow) &&
          <ActivityTime
            activity={activity}
            finishActivity={(activity) => {
              this.updateStore();
              this.props.finishActivity(activity);

              sendData('finish_activity', activity.id, currentApplet.id);
            }}
          />
        }
        {!isSummaryScreen && !isSplashScreen && isActivityShow && (
          <ActivityScreens
            activity={activity}
            answers={responses}
            currentScreen={currentScreen}
            hasSplashScreen={hasSplashScreen}
            onChange={(answer, goToNext=false, timeElapsed=0) => {
              responses[currentScreen] = answer;
              if (this.currentItem.inputType != 'drawing' && this.currentItem.inputType != 'trail') {
                sendData('set_response', { [activity.items[currentScreen].id]: answer }, currentApplet.id);
              }
              this.setState({ responses })
              this.handleChange(responses, goToNext, timeElapsed);
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
            isSummaryScreen={isSummaryScreen}
            isSplashScreen={!!isSplashScreen}
            watermark={currentApplet.watermark}
            topNavigation={topNavigation}
            prevEnabled={!isSummaryScreen && isPrevEnabled(currentScreen, activity)}
            onPressPrevScreen={this.handlePressPrevScreen}
            nextEnabled={isNextEnabled(currentScreen, activity, responses)}
            onPressNextScreen={this.handlePressNextScreen}
            onPressAction={() => {
              responses[currentScreen] = undefined;
              this.setState({ responses });

              sendData('set_response', { [activity.items[currentScreen].id]: undefined }, currentApplet.id);
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
                nextEnabled={isSplashScreen || isNextEnabled(currentScreen, activity, responses, tutorialStatus)}
                onPressNext={() => this.handlePressNextScreen(nextLabel)}
                prevLabel={prevLabel}
                prevEnabled={!isSummaryScreen && isPrevEnabled(currentScreen, activity)}
                onPressPrev={() => this.handlePressPrevScreen()}
                actionLabel={actionLabel}
                timerEnabled={timerEnabled}
                timeLeft={timerEnabled && responses[currentScreen]?.timeLeft || 0}
                timeLimit={timerEnabled && responses[currentScreen]?.timeLimit || 0}
                timerActive={responses[currentScreen]?.timerActive}
                lastAvailableTime={responses[currentScreen]?.lastAvailableTime}
                appStatus={appStatus}
                setTimerStatus={(timerActive, timeLeft, lastAvailableTime=0) => {
                  const response = responses[currentScreen] || {};

                  if (timeLeft <= 0 && response.timeLimit) {
                    this.setState({
                      modalVisible: true
                    })
                  }

                  responses[currentScreen] = {
                    value: response.value,
                    timerActive,
                    timeLeft,
                    timeLimit: response.timeLimit,
                    lastAvailableTime
                  };

                  this.setState({ responses });

                  if (currentResponse && lastAvailableTime) {
                    setAnswer(
                      currentResponse.activity,
                      currentScreen,
                      responses[currentScreen]
                    );
                  }
                }}
                onPressAction={() => {
                  if (timerEnabled) {
                    responses[currentScreen] = { ...responses[currentScreen], value: undefined };
                  } else {
                    responses[currentScreen] = undefined;
                  }

                  this.setState({ responses, optionalTextChanged: false });

                  this.userEvents.push({
                    type: 'UNDO',
                    time: Date.now(),
                    screen: currentScreen
                  })

                  sendData('set_response', { [activity.items[currentScreen].id]: responses[currentScreen] }, currentApplet.id);
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
  tutorialStatus: 1,
  currentScreen: null,
};

Activity.propTypes = {
  currentApplet: PropTypes.object.isRequired,
  currentResponse: PropTypes.object,
  tutorialStatus: PropTypes.number.isRequired,
  tutorialIndex: PropTypes.number.isRequired,
  setAnswer: PropTypes.func.isRequired,
  authToken: PropTypes.string.isRequired,
  currentScreen: PropTypes.number,
  setSelected: PropTypes.func.isRequired,
  nextScreen: PropTypes.func.isRequired,
  prevScreen: PropTypes.func.isRequired,
  setTutorialStatus: PropTypes.func.isRequired,
  setTutorialIndex: PropTypes.func.isRequired,
  completeResponse: PropTypes.func.isRequired,
  itemVisibility: PropTypes.array.isRequired,
  setCurrentActivity: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  currentApplet: currentAppletSelector(state),
  currentResponse: currentResponsesSelector(state),
  tutorialStatus: tutorialStatusSelector(state),
  tutorialIndex: tutorialIndexSelector(state),
  authToken: authTokenSelector(state),
  currentScreen: currentScreenSelector(state),
  itemVisibility: itemVisiblitySelector(state),
  isSummaryScreen: isSummaryScreenSelector(state),
  lastResponseTime: lastResponseTimeSelector(state),
  isSplashScreen: isSplashScreenSelector(state),
  isSelected: state.responses.isSelected,
  appStatus: appStatusSelector(state),
});

const mapDispatchToProps = {
  setCurrentActivity,
  setAnswer,
  setSelected,
  nextScreen,
  prevScreen,
  setTutorialStatus,
  setTutorialIndex,
  completeResponse,
  setSummaryScreen,
  setSplashScreen,
  setCurrentScreen,
  finishActivity,
  addUserActivityEvents
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Activity);
