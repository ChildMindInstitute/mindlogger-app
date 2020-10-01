import React from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import { Container } from 'native-base';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import _ from 'lodash';
import { Actions } from 'react-native-router-flux';
import moment from 'moment';
import { getStore } from '../../store';
import {
  nextScreen,
  prevScreen,
  completeResponse,
} from '../../state/responses/responses.thunks';
import {
  currentResponsesSelector,
  itemVisiblitySelector,
  currentScreenSelector,
} from '../../state/responses/responses.selectors';
import { currentAppletSelector } from '../../state/app/app.selectors';
import { 
  setCurrentActivity,
  setActivitySelectionDisabled,
} from '../../state/app/app.actions';
import {
  setAnswer,
  setSelected,
} from '../../state/responses/responses.actions';

import { authTokenSelector } from '../../state/user/user.selectors';
import ActivityScreens from '../../components/ActivityScreens';
import ActivitySummary from '../ActivitySummary';
import ActHeader from '../../components/header';
import ActProgress from '../../components/progress';
import ActivityButtons from '../../components/ActivityButtons';
import {
  getNextPos,
  getNextLabel,
  getPrevLabel,
  getActionLabel,
  isNextEnabled,
  isPrevEnabled,
} from '../../services/activityNavigation';
import Timer from '../../services/timer';


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
  constructor() {
    super();
    this.state = { isContentError: false, idleTime: null, isSummaryScreen: false };
    this.idleTimer = new Timer();
  }

  componentDidMount() {
    this.props.setActivitySelectionDisabled(false);
    this.setState({ idleTime: this.getIdleTime() }, () => {
      if (this.state.idleTime) {
        this.idleTimer.startCountdown(
          this.state.idleTime,  // Time in seconds.
          this.handleTimeIsUp,  // Callback.
        );
      }
    });
  }

  get currentItem() {
    return R.path(
      ['items', this.props.currentScreen],
      this.props.currentResponse.activity,
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
            dayOfMonth === moment().date()
            && month === moment().month()
            && year === moment().year()
          );
        }
        return true;
      },
    );

    const allow = _.get(currentEvent, 'data.idleTime.allow', false);
    if (allow) {
      const idleMinutes = _.get(currentEvent, 'data.idleTime.minute', null);
      return idleMinutes && parseInt(idleMinutes, 10) * 60;
    }
    return null;
  };

  handleTimeIsUp = () => {
    this.props.completeResponse();
    Actions.replace('activity_thanks');
  };

  render() {
    const {
      currentApplet,
      setAnswer,
      currentResponse,
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
    const prevLabel = getPrevLabel(currentScreen, itemVisibility);

    return (
      <Container style={{ flex: 1 }}>
        <StatusBar hidden />
        {!isSummaryScreen ? (
          <ActivityScreens
            activity={activity}
            answers={responses}
            currentScreen={currentScreen}
            onChange={(answer, goToNext = false) => {
              setAnswer(currentApplet.id, activity.id, currentScreen, answer);
              if (goToNext || autoAdvance || fullScreen) {
                nextScreen();
                setSelected(false);
              }
            }}
            authToken={authToken}
            onContentError={() => this.setState({ isContentError: true })}
            onAnyTouch={this.idleTimer.resetCountdown}
          />
        ) : (
          <ActivitySummary />
        )
        }
        {!fullScreen && (
          <View onTouchStart={this.idleTimer.resetCountdown} style={styles.buttonArea}>
            {activity.items.length > 1 && (
              <ActProgress
                index={currentScreen}
                length={activity.items.length}
              />
            )}
            <ActivityButtons
              nextLabel={getNextLabel(
                currentScreen,
                itemVisibility,
                activity,
                responses,
                this.state.isContentError
              )}
              nextEnabled={isNextEnabled(
                currentScreen,
                activity,
                responses
              )}
              onPressNext={() => {
                this.setState({ isContentError: false });
                if (getNextPos(currentScreen, itemVisibility) === -1
                  && activity.compute
                  && !isSummaryScreen
                ) {
                  console.log('111111111111');
                  this.setState({ isSummaryScreen: true });
                } else {
                  console.log('000000000000');
                  nextScreen();
                  if (isSelected) {
                    setSelected(false);
                  }
                }
              }}
              prevLabel={prevLabel}
              prevEnabled={isPrevEnabled(currentScreen, activity)}
              onPressPrev={() => {
                if (!currentScreen) {
                  setCurrentActivity(null);
                }
                prevScreen();
                
                if (isSelected) {
                  setSelected(false);
                }
              }}
              actionLabel={getActionLabel(
                currentScreen,
                responses,
                activity.items,
              )}
              onPressAction={() => {
                setAnswer(
                  currentApplet.id,
                  activity.id,
                  currentScreen,
                  undefined,
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

const mapStateToProps = state => ({
  currentApplet: currentAppletSelector(state),
  currentResponse: currentResponsesSelector(state),
  authToken: authTokenSelector(state),
  currentScreen: currentScreenSelector(state),
  itemVisibility: itemVisiblitySelector(state),
  isSelected: state.responses.isSelected,
});

const mapDispatchToProps = {
  setCurrentActivity,
  setAnswer,
  setSelected,
  nextScreen,
  prevScreen,
  completeResponse,
  setActivitySelectionDisabled,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Activity);
