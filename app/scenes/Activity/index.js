import React from "react";
import { StatusBar, View, Text, StyleSheet, Alert, Image } from "react-native";
import { Container } from "native-base";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import * as R from "ramda";
import _ from "lodash";
import i18n from "i18next";
import { addUserActivityEvents } from "../../state/responses/responses.actions";
import {
  nextScreen,
  prevScreen,
  completeResponse,
  finishActivity,
  finishActivityDueToTimer
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
import { collectResponseTimes, getItemsVisibility } from "../../services/visibility";
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
import { getSummaryScreenDataForActivity } from "../../services/alert";

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

const inputTypeCollection = [
  'radio', 'stackedRadio', 'slider', 'stackedSlider', 'timeRange', 'duration',
  'date', 'ageSelector', 'select', 'text', 'time', 'geolocation',
  'pastBehaviorTracker', 'futureBehaviorTracker', 'dropdownList'
];

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
      visibleAct: null,
      visibility: [],
      optionalTextChanged: false
    };
    this.userEvents = [];
    this.idleTimer = new Timer();
    this.completed = false;
  }

  get currentItem() {
    return R.path(
      ["items", this.props.currentScreen],
      this.state.visibleAct
    );
  }

  componentDidMount() {
    const { isSummaryScreen, isSplashScreen, currentResponse, currentScreen, itemVisibility } = this.props;
    const { activity, responses } = currentResponse;
    const visibleAct = activity.isActivityFlow ? this.getActivityData() : activity;
    const idleTime = this.getIdleTime();

    if (activity.isActivityFlow) {
      if (
        isSplashScreen === true &&
        visibleAct.splash &&
        visibleAct.splash.en &&
        currentScreen === 0
      ) {
        setSplashScreen(activity, visibleAct.splash.en);
      } else {
        setSplashScreen(activity, false);
      }
    }

    this.setState({
      isSummaryScreen,
      idleTime,
      hasSplashScreen: visibleAct.splash && visibleAct.splash.en && currentScreen === 0 && !isSummaryScreen,
      responses,
      visibleAct,
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
      (!oldProps.currentResponse || oldProps.currentResponse.responses != this.props.currentResponse.responses)
    ) {
      this.setState({ responses: this.props.currentResponse.responses })
    }
  }

  processSetAnswerEvent(activity, responses, currentScreen) {
    const userEvent = {
      type: 'SET_ANSWER',
      time: Date.now(),
      screen: currentScreen
    };

    const inputType = activity.items[currentScreen].inputType;

    const currentScreenResponses = responses[currentScreen];

    if (currentScreenResponses) {
      if (inputTypeCollection.indexOf(inputType) >= 0) {
        const parsedResponses = JSON.parse(JSON.stringify(currentScreenResponses));
        userEvent.response = parsedResponses;
      } else if (typeof responses[currentScreen] == 'object' && responses[currentScreen].text) {
        userEvent.response = { 
          text: responses[currentScreen].text 
        };
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

  findActivity = (name, activities = []) => {
    if (!name) return undefined;
    return _.find(activities, { name: { en: name } });
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
      this.props.finishActivityDueToTimer(this.props.currentResponse.activity);
    }
  }

  processTrailTutrial(activity) {
    const {
      setTutorialStatus,
      setTutorialIndex,
      tutorialStatus,
      tutorialIndex,
      currentScreen
    } = this.props;
  
    const screen = activity.items[currentScreen].variableName;
    let currentActivity = 'activity1';    

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
        return true;
      } else if (currentScreen !== 3) {
        setTutorialStatus(1);
      }
    }
    return false;
  }

  showAlertForIncorrectAnswer(activity, currentScreen) {
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
        return true;
      }
    }
    return false;
  }

  addEventOnNextClick(nextLabel, isSummaryScreen, currentScreen) {
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
  }

  moveToSummaryOrToNextScreen(itemVisibility, timeElapsed, trigger) {
    const {
      currentResponse,
      setSummaryScreen,
      nextScreen,
      setSelected,
      orderIndex,
      currentScreen
    } = this.props;

    const { isSummaryScreen } = this.state;

    const next = getNextPos(currentScreen, itemVisibility);

    const flow = currentResponse.activity.isActivityFlow ? currentResponse.activity : null;

    const activity = this.state.visibleAct;

    const summaryScreenIsComing = !!(
      next === -1 &&
      !isSummaryScreen &&
      (
        flow && !flow.summaryDisabled && flow.order.length == 1 + orderIndex[flow.id] ||
        !flow && !activity.summaryDisabled
      )
    )

    const singleActityScreenHasData = 
      summaryScreenIsComing && 
      !flow && 
      getSummaryScreenDataForActivity(currentResponse.activity, currentResponse.activity.id, null, this.state.responses).hasData();

    if (summaryScreenIsComing && (flow || singleActityScreenHasData)) {
      this.setState({ isSummaryScreen: true });
      setSummaryScreen(currentResponse.activity, true);
      return;
    }
    
    if (trigger.isNextButton) {
      if (isSummaryScreen) {
        this.setState({ isSummaryScreen: false });
        setSummaryScreen(currentResponse.activity, false);
      }

      if (!this.completed) {
        if (next == -1) {
          this.completed = true;
        }
        nextScreen();
        setSelected(false);
      }
    }
    
    if (trigger.isUserSelect) {
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

  handleChange(responses, goToNext=false, timeElapsed=0) {
    const {
      currentScreen,
      currentApplet,
      lastResponseTime
    } = this.props;

    const activity = this.state.visibleAct;
    
    if (!goToNext || !timeElapsed) {
      this.processSetAnswerEvent(activity, responses, currentScreen)
    }

    if (!goToNext && (this.currentItem.inputType === 'stackedRadio' || this.currentItem.inputType == 'stackedSlider')) {
      return;
    }

    const fullScreen = this.currentItem.fullScreen || activity.fullScreen;
    const autoAdvance = this.currentItem.autoAdvance || activity.autoAdvance;
    const optionalText = this.currentItem.isOptionalText;

    const evaluateNextScreen = (autoAdvance || fullScreen) && !optionalText || goToNext;

    if (!evaluateNextScreen) {
      return;
    }

    if (!this.completed) {
      this.updateStore();
    }

    const responseTimes = collectResponseTimes(currentApplet, lastResponseTime);

    const itemsVisibility = getItemsVisibility(activity, responses, responseTimes);

    this.setState({ itemsVisibility });

    this.moveToSummaryOrToNextScreen(itemsVisibility, timeElapsed, { isUserSelect: true });
  }

  handlePressNextScreen = (nextLabel = null) => {
    const {
      currentResponse,
      currentScreen,
      itemVisibility,
      setSplashScreen,
      setCurrentScreen,
      isSplashScreen,
    } = this.props;

    const { isSummaryScreen } = this.state;
    const activity = this.state.visibleAct;

    if (this.processTrailTutrial(activity)) {
      return;
    }

    this.addEventOnNextClick(nextLabel, isSummaryScreen, currentScreen)

    this.setState({ optionalTextChanged: false });

    if (!this.completed) {
      this.updateStore();
    }

    if (isSplashScreen) {
      let activityObj = currentResponse.activity;
      const objectId = activityObj.event ? activityObj.id + activityObj.event.id : activityObj.id;
      setSplashScreen(activityObj, false);
      setCurrentScreen(objectId, currentScreen)
      return;
    }

    if (this.showAlertForIncorrectAnswer(activity, currentScreen)) {
      return;
    }

    this.setState({ isContentError: false });

    this.moveToSummaryOrToNextScreen(itemVisibility, undefined, { isNextButton: true });
  }

  handlePressPrevScreen = () => {
    const { isSummaryScreen, visibleAct } = this.state;
    const {
      setSummaryScreen,
      currentScreen,
      prevScreen,
      setSelected,
      isSelected,
      currentResponse,
    } = this.props;

    this.userEvents.push({
      type: 'PREV',
      time: Date.now(),
      screen: currentScreen
    });

    this.setState({ optionalTextChanged: false });

    this.updateStore();

    if (isSummaryScreen) {
      this.setState({ isSummaryScreen: false });
      setSummaryScreen(currentResponse.activity, false);
      setSelected(false);
    } else {
      prevScreen();
      if (isSelected) {
        setSelected(false);
      }
    }
  }

  updateStore () {
    const { currentScreen, addUserActivityEvents } = this.props;
    if (!this.props.currentResponse) return;

    const activity = this.props.currentResponse.activity;

    if (activity) {
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
  }

  getActivityData() {
    const { currentApplet, orderIndex } = this.props;
    const { activity } = this.props.currentResponse;
    const orderActivity = activity.activityFlowId
      ? activity.activityFlowOrder[orderIndex[activity.activityFlowId] || 0]
      : activity.order[orderIndex[activity.id] || 0];

    return currentApplet.activities.find(act => act.name.en === orderActivity);
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
      orderIndex,
    } = this.props;
    const { visibility, isSummaryScreen, isActivityShow, hasSplashScreen, modalVisible } = this.state;
    const isSplashScreen = this.props.isSplashScreen && hasSplashScreen;

    if (!currentResponse || !this.currentItem) {
      return <View />;
    }

    const timerEnabled = this.currentItem.inputType == 'futureBehaviorTracker';
    const { responses } = this.state;
    const activity = currentResponse.activity.isActivityFlow ? this.getActivityData() : currentResponse.activity;
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
            disableCloseIcon={false}
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
        {(currentResponse.activity.event && currentResponse.activity.event.data.timedActivity.allow) &&
          <ActivityTime 
            activity={currentResponse.activity}
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
            onChange={(answer, goToNext = false, timeElapsed = 0) => {
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
          <ActivitySummary
            responses={responses}
            activity={activity}
            flow={currentResponse.activity.isActivityFlow ? currentResponse.activity : null}
            orderIndex={orderIndex}
          />
        )}
        {!!isSplashScreen && (
          <ActivitySplash activity={activity} />
        )}
        {!fullScreen &&
          <ActHeader
            title={activity.name.en}
            actionLabel={actionLabel}
            isSummaryScreen={isSummaryScreen}
            isSplashScreen={!!isSplashScreen}
            watermark={currentApplet.watermark}
            disableCloseIcon={topNavigation}
            topNavigation={false}
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
  orderIndex: state.activities.orderIndex || {},
  appStatus: appStatusSelector(state),
});

const mapDispatchToProps = {
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
  finishActivityDueToTimer,
  addUserActivityEvents
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Activity);
