import React from "react";
import { StatusBar, View, Text, StyleSheet, Alert } from "react-native";
import { Container } from "native-base";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import * as R from "ramda";
import _ from "lodash";
import { Actions } from "react-native-router-flux";
import i18n from "i18next";
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
  currentScreenSelector,
} from "../../state/responses/responses.selectors";
import { currentAppletSelector } from "../../state/app/app.selectors";
import { testVisibility } from "../../services/visibility";
import {
  setCurrentActivity,
  setActivitySelectionDisabled,
} from "../../state/app/app.actions";
import {
  appStatusSelector
} from "../../state/app/app.selectors";
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
});

class Activity extends React.Component {
  constructor() {
    super();
    this.state = {
      isContentError: false,
      idleTime: null,
      isSummaryScreen: false,
      isSplashScreen: false,
      isActivityShow: false,
      hasSplashScreen: false,
      responses: []
    };
    this.idleTimer = new Timer();
  }

  componentDidMount() {
    const { isSummaryScreen, currentResponse: { activity, responses }, currentScreen } = this.props;
    const idleTime = this.getIdleTime();

    this.props.setActivitySelectionDisabled(false);
    this.setState({
      isSummaryScreen,
      idleTime,
      isSplashScreen: activity.splash && activity.splash.en && currentScreen === 0 && !isSummaryScreen,
      hasSplashScreen: activity.splash && activity.splash.en && currentScreen === 0 && !isSummaryScreen,
      responses,
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
  }

  handleChange(responses, goToNext=false, timeElapsed=0) {
    const { isSummaryScreen } = this.state;
    const {
      currentApplet,
      currentResponse,
      currentScreen,
      nextScreen,
      isSelected,
      setSummaryScreen,
      setSelected,
      setAnswer
    } = this.props;
    const { activity } = currentResponse;
    const fullScreen = this.currentItem.fullScreen || activity.fullScreen;
    const autoAdvance = this.currentItem.autoAdvance || activity.autoAdvance;
    const optionalText = this.currentItem.isOptionalText

    const visibility = activity.items.map((item) => {
      if (item.isvis) {
        return false;
      }
      return testVisibility(item.visibility, activity.items, responses)
    });
    const next = getNextPos(currentScreen, visibility);

    if (!goToNext && (this.currentItem.inputType === 'stackedRadio' || this.currentItem.inputType == 'stackedSlider')) {
      return;
    }

    if ((autoAdvance || fullScreen) && !optionalText || goToNext) {
      this.updateStore();

      if (next === -1 && activity.compute && !activity.summaryDisabled && !isSummaryScreen) {
        this.setState({ isSummaryScreen: true });
        setSummaryScreen(activity, true);
      } else {
        if (isSummaryScreen) {
          this.setState({ isSummaryScreen: false });
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
      currentResponse
    } = this.props;
    const { activity, responses } = currentResponse;

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

    this.updateStore();

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
      setSummaryScreen(activity, true);
    } else {
      if (isSummaryScreen) {
        this.setState({ isSummaryScreen: false });
        setSummaryScreen(activity, false);
      }
      nextScreen();
      setSelected(false);
    }
  }

  updateStore () {
    const { currentScreen } = this.props;
    if (!this.props.currentResponse) return;

    this.props.setAnswer(
      this.props.currentResponse.activity,
      currentScreen,
      this.state.responses[currentScreen]
    );
  }

  componentWillUnmount() {
    this.updateStore();
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
    } = this.props;

    const { isSummaryScreen, isSplashScreen, isActivityShow, hasSplashScreen } = this.state;

    if (!currentResponse) {
      return <View />;
    }

    const { activity } = currentResponse;
    const { responses } = this.state;
    const { removeUndoOption } = this.currentItem.valueConstraints;
    const { topNavigation } = this.currentItem.valueConstraints;
    const fullScreen = (this.currentItem && this.currentItem.fullScreen) || activity.fullScreen;
    const nextLabel = isSummaryScreen
      ? "Next"
      : getNextLabel(
        currentScreen,
        isSplashScreen,
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
            isSummaryScreen={isSummaryScreen}
            prevLabel={prevLabel}
            topNavigation={topNavigation}
            prevEnabled={!isSummaryScreen && isPrevEnabled(currentScreen, activity)}
            onPressPrevScreen={this.handlePressPrevScreen}
            nextEnabled={isNextEnabled(currentScreen, activity, responses)}
            onPressNextScreen={this.handlePressNextScreen}
            onPressAction={() => {
              responses[currentScreen] = undefined;
              this.setState({ responses })
            }}
          />
        }
        {(activity.event && activity.event.data.timedActivity.allow) &&
          <ActivityTime
            activity={activity}
            finishActivity={(activity) => {
              this.updateStore();
              this.props.finishActivity(activity);
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
              this.setState({ responses })
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
            }}
          />
        }
        {!fullScreen && (
          <View
            onTouchStart={this.idleTimer.resetCountdown}
            style={styles.buttonArea}
          >
            {activity.items.length > 1 && (
              <ActProgress
                index={currentScreen}
                length={activity.items.length}
              />
            )}
            {!topNavigation &&
              <ActivityButtons
                nextLabel={nextLabel}
                nextEnabled={isSplashScreen || isNextEnabled(currentScreen, activity, responses)}
                onPressNext={() => this.handlePressNextScreen()}
                prevLabel={prevLabel}
                prevEnabled={!isSummaryScreen && isPrevEnabled(currentScreen, activity)}
                onPressPrev={() => this.handlePressPrevScreen()}
                actionLabel={actionLabel}
                onPressAction={() => {
                  responses[currentScreen] = undefined;
                  this.setState({ responses });
                }}
              />
            }

          </View>
        )}
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
  finishActivity
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Activity);
