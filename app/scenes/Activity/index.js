import React from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import { Container } from 'native-base';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import _ from 'lodash';
import { Actions } from 'react-native-router-flux';
import moment from 'moment';
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
  setAnswer,
  setSelected,
  getResponseInActivity,
} from '../../state/responses/responses.actions';

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
import { idleTimer } from '../../services/idleTimer';

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
    this.state = { isContentError: false, idleTime: null };
  }

  componentDidMount() {
    this.setState({ idleTime: this.getIdleTime() }, () => {
      if (this.state.idleTime) {
        idleTimer.subscribe(this.state.idleTime, this.handleTimeIsUp);
      }
    });
  }

  componentWillUnmount() {
    if (this.state.idleTime) {
      idleTimer.unsubscribe();
    }
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
      getResponseInActivity,
      authToken,
      currentScreen,
      nextScreen,
      prevScreen,
      setSelected,
      itemVisibility,
      isSelected,
    } = this.props;

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
          onAnyTouch={idleTimer.resetTimer}
        />
        {!fullScreen && (
          <View onTouchStart={idleTimer.resetTimer} style={styles.buttonArea}>
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
                this.state.isContentError,
              )}
              nextEnabled={isNextEnabled(currentScreen, activity, responses)}
              onPressNext={() => {
                this.setState({ isContentError: false });
                nextScreen();
                if (isSelected) {
                  setSelected(false);
                }
              }}
              prevLabel={prevLabel}
              prevEnabled={isPrevEnabled(currentScreen, activity)}
              onPressPrev={() => {
                if (!currentScreen) {
                  getResponseInActivity(false);
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
  getResponseInActivity: PropTypes.func.isRequired,
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
  getResponseInActivity,
  setAnswer,
  setSelected,
  nextScreen,
  prevScreen,
  completeResponse,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Activity);
