import React from "react";
import { StatusBar, View, StyleSheet, Alert } from "react-native";
import { Container } from "native-base";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import * as R from "ramda";
import _ from "lodash";
import { Actions } from "react-native-router-flux";
import moment from "moment";
import i18n from "i18next";
import { getStore } from "../../store";
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
} from "../../state/responses/responses.selectors";
import { currentAppletSelector } from "../../state/app/app.selectors";
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
    };
    this.idleTimer = new Timer();
  }

  componentDidMount() {
    const { isSummaryScreen } = this.props;
    this.props.setActivitySelectionDisabled(false);
    this.setState({ isSummaryScreen, idleTime: this.getIdleTime() }, () => {
      if (this.state.idleTime) {
        this.idleTimer.startCountdown(
          this.state.idleTime, // Time in seconds.
          this.handleTimeIsUp // Callback.
        );
      }
    });
  }

  handleChange(answer, goToNext) {
    const { isSummaryScreen } = this.state;
    const {
      currentApplet,
      currentResponse,
      currentScreen,
      nextScreen,
      isSelected,
      setSummaryScreen,
      setSelected,
    } = this.props;
    const { activity, responses } = currentResponse;
    const fullScreen = this.currentItem.fullScreen || activity.fullScreen;
    const autoAdvance = this.currentItem.autoAdvance || activity.autoAdvance;

    responses[currentScreen] = answer;
    const visibility = activity.items.map((item) =>
      testVisibility(item.visibility, activity.items, responses)
    );
    const next = getNextPos(currentScreen, visibility);
    if (autoAdvance || fullScreen) {
      if (next === -1 && activity.compute && !isSummaryScreen) {
        this.setState({ isSummaryScreen: true });
        setSummaryScreen(true);
      } else {
        if (isSummaryScreen) {
          this.setState({ isSummaryScreen: false });
        }
        nextScreen();
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
    const currentEvent = this.props.currentApplet.schedule.events.find(
      ({ schedule }) => {
        if (schedule.dayOfMonth && schedule.month && schedule.year) {
          const [dayOfMonth] = schedule.dayOfMonth;
          const [month] = schedule.month;
          const [year] = schedule.year;
          return (
            dayOfMonth === moment().date() &&
            month === moment().month() &&
            year === moment().year()
          );
        }
        return true;
      }
    );

    const allow = _.get(currentEvent, "data.idleTime.allow", false);
    if (allow) {
      const idleMinutes = _.get(currentEvent, "data.idleTime.minute", null);
      return idleMinutes && parseInt(idleMinutes, 10) * 60;
    }
    return null;
  };

  handleTimeIsUp = () => {
    this.props.completeResponse();
    Actions.replace("activity_thanks");
  };

  render() {
    const {
      currentApplet,
      setAnswer,
      currentResponse,
      setSummaryScreen,
      setCurrentActivity,
      authToken,
      currentScreen,
      nextScreen,
      prevScreen,
      setSelected,
      itemVisibility,
      isSelected,
    } = this.props;

    const { isSummaryScreen } = this.state;

    if (!currentResponse) {
      return <View />;
    }

    const { activity, responses } = currentResponse;

    const fullScreen = this.currentItem.fullScreen || activity.fullScreen;
    const autoAdvance = this.currentItem.autoAdvance || activity.autoAdvance;
    const prevLabel = isSummaryScreen
      ? "Back"
      : getPrevLabel(currentScreen, itemVisibility);
    const nextLabel = isSummaryScreen
      ? "Next"
      : getNextLabel(
          currentScreen,
          itemVisibility,
          activity,
          responses,
          this.state.isContentError
        );
    const actionLabel = isSummaryScreen
      ? ""
      : getActionLabel(currentScreen, responses, activity.items);

    return (
      <Container style={{ flex: 1 }}>
        <StatusBar hidden />
        {activity.lastTimedActivity && <ActivityTime activity={activity} />}
        {!isSummaryScreen ? (
          <ActivityScreens
            activity={activity}
            answers={responses}
            currentScreen={currentScreen}
            onChange={(answer, goToNext = false) => {
              setAnswer(currentApplet.id, activity.id, currentScreen, answer);
              this.handleChange(answer, goToNext);
            }}
            authToken={authToken}
            onContentError={() => this.setState({ isContentError: true })}
            onAnyTouch={this.idleTimer.resetCountdown}
          />
        ) : (
          <ActivitySummary responses={responses} activity={activity} />
        )}
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
            <ActivityButtons
              nextLabel={nextLabel}
              nextEnabled={isNextEnabled(currentScreen, activity, responses)}
              onPressNext={() => {
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
              }}
              prevLabel={prevLabel}
              prevEnabled={!isSummaryScreen && isPrevEnabled(currentScreen, activity)}
              onPressPrev={() => {
                const { isSummaryScreen } = this.state;
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
              }}
              actionLabel={actionLabel}
              onPressAction={() => {
                setAnswer(
                  currentApplet.id,
                  activity.id,
                  currentScreen,
                  undefined
                );
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
