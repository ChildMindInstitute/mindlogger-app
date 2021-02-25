// Third-party libraries.
import React, { useState, useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { View } from 'react-native';

// Local.
import { delayedExec, clearExec } from '../../services/timing';
import sortActivities from './sortActivities';
import ActivityListItem from './ActivityListItem';
import {
  newAppletSelector,
  activitySelectionDisabledSelector,
} from '../../state/app/app.selectors';
import { activityAccessSelector } from '../../state/applets/applets.selectors';
import { getSchedules, setReminder, cancelReminder } from '../../state/applets/applets.thunks';
import { syncUploadQueue } from '../../state/app/app.thunks';
import { setUpdatedTime, setAppStatus } from '../../state/app/app.actions';
import { setScheduleUpdated } from '../../state/applets/applets.actions';
import {
  responseScheduleSelector,
  inProgressSelector,
} from '../../state/responses/responses.selectors';

import { parseAppletActivities } from '../../models/json-ld';

const ActivityList = ({
  applet,
  syncUploadQueue,
  appStatus,
  setAppStatus,
  getSchedules,
  setReminder,
  cancelReminder,
  scheduleUpdated,
  setScheduleUpdated,
  setUpdatedTime,
  appletTime,
  lastUpdatedTime,
  activityEndTimes,
  responseSchedule,
  inProgress,
  activityAccess,
  onPressActivity,
  onLongPressActivity,
}) => {
  // const newApplet = getActivities(applet.applet, responseSchedule);
  const [activities, setActivities] = useState([]);
  const [prizeActivity, setPrizeActivity] = useState(null);
  const [isConnected, setIsConnected] = useState(true);

  const updateStatusDelay = 60 * 1000;
  const updateScheduleDelay = 24 * 3600 * 1000;

  const stateUpdate = () => {
    const newApplet = parseAppletActivities(applet, responseSchedule);

    const appletActivities = newApplet.activities.filter(act => act.isPrize != true);
    setActivities(sortActivities(applet.id, appletActivities, inProgress, activityEndTimes, activityAccess));

    const pzActs = newApplet.activities.filter(act => act.isPrize === true)
    if (pzActs.length === 1) {
      setPrizeActivity(pzActs[0]);
    }
  };

  const scheduleUpdate = () => {
    const currentTime = new Date();
    const appletId = applet.id;

    if (lastUpdatedTime[appletId]) {

      if (!moment().isSame(moment(new Date(lastUpdatedTime[appletId])), 'day')) {
        const updatedTime = lastUpdatedTime;
        updatedTime[appletId] = currentTime;
        getSchedules(appletId.split('/')[1]);
        setUpdatedTime(updatedTime);
      } else {
        const updatedTime = lastUpdatedTime;
        updatedTime[appletId] = currentTime;
        setUpdatedTime(updatedTime);
      }
    } else if (!moment().isSame(moment(appletTime), 'day')) {
      const updatedTime = lastUpdatedTime;
      updatedTime[appletId] = appletTime;

      getSchedules(appletId.split('/')[1]);
      setUpdatedTime(updatedTime);
    } else {
      const updatedTime = lastUpdatedTime;
      updatedTime[appletId] = appletTime;

      setUpdatedTime(updatedTime);
    }
  };

  const handleConnectivityChange = (connection) => {
    if (connection.isConnected) {
      cancelReminder();

      if (!isConnected) {
        syncUploadQueue();
        setIsConnected(true);
      }
    } else {
      setIsConnected(false);
      setReminder();
    }
  }

  // useInterval(stateUpdate, updateStatusDelay, Object.keys(inProgress).length, responseSchedule);

  useEffect(() => {
    let updateId;

    stateUpdate();
    const leftTime = (60 - new Date().getSeconds()) * 1000;
    const leftOutId = delayedExec(
      () => {
        stateUpdate();
        updateId = delayedExec(stateUpdate, { every: updateStatusDelay });
      },
      { after: leftTime },
    );

    return () => {
      clearExec(leftOutId);
      if (updateId) {
        clearExec(updateId);
      }
    }
  }, [Object.keys(inProgress).length, responseSchedule]);

  useEffect(() => {
    let intervalId;
    const currentTime = new Date();
    const nextDay = new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      currentTime.getDate() + 1,
    );
    const leftTimeout = nextDay.getTime() - currentTime.getTime() + 1000;

    const leftTimeoutId = delayedExec(
      () => {
        scheduleUpdate();
        intervalId = delayedExec(scheduleUpdate, { every: updateScheduleDelay });
      },
      { after: leftTimeout },
    );

    const netInfoUnsubscribe = NetInfo.addEventListener(handleConnectivityChange);

    return () => {
      if (netInfoUnsubscribe) {
        netInfoUnsubscribe();
      }

      clearExec(leftTimeoutId);
      if (intervalId) {
        clearExec(intervalId);
      }
    };
  }, []);

  useEffect(() => {
    if (appStatus) {
      stateUpdate();
      setAppStatus(false);
    }
  }, [appStatus]);

  useEffect(() => {
    if (scheduleUpdated) {
      stateUpdate();
      setScheduleUpdated(false);
    }
  }, [applet.schedule]);

  return (
    <View style={{ paddingBottom: 30 }}>
      {activities.map(activity => (
        <ActivityListItem
          disabled={activity.status === 'scheduled' && !activity.nextAccess}
          onPress={() => onPressActivity(activity)}
          onLongPress={() => onLongPressActivity(activity)}
          activity={activity}
          key={activity.id || activity.text}
        />
      ))}
      {prizeActivity && (
        <ActivityListItem
          onPress={() => onPressActivity(prizeActivity)}
          onLongPress={() => onLongPressActivity(prizeActivity)}
          activity={prizeActivity}
        />
      )}
    </View>
  );
};

ActivityList.propTypes = {
  applet: PropTypes.object.isRequired,
  appStatus: PropTypes.bool.isRequired,
  setAppStatus: PropTypes.func.isRequired,
  responseSchedule: PropTypes.object.isRequired,
  activityAccess: PropTypes.object.isRequired,
  appletTime: PropTypes.any.isRequired,
  inProgress: PropTypes.object.isRequired,
  onPressActivity: PropTypes.func.isRequired,
  onLongPressActivity: PropTypes.func.isRequired,
  lastUpdatedTime: PropTypes.object.isRequired,
  activityEndTimes: PropTypes.object.isRequired,
  setUpdatedTime: PropTypes.func.isRequired,
  getSchedules: PropTypes.func.isRequired,
  setScheduleUpdated: PropTypes.func.isRequired,
  scheduleUpdated: PropTypes.bool.isRequired,
  syncUploadQueue: PropTypes.func.isRequired,
  setReminder: PropTypes.func.isRequired,
  cancelReminder: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    lastUpdatedTime: state.app.lastUpdatedTime,
    activityEndTimes: state.app.finishedTimes,
    appStatus: state.app.appStatus,
    scheduleUpdated: state.applets.scheduleUpdated,
    applet: newAppletSelector(state),
    appletTime: state.applets.currentTime,
    activitySelectionDisabled: activitySelectionDisabledSelector(state),
    responseSchedule: responseScheduleSelector(state),
    activityAccess: activityAccessSelector(state),
    inProgress: inProgressSelector(state),
  };
};

// const mapDispatchToProps = dispatch => ({
//   setUpdatedTime: updatedTime => dispatch(setUpdatedTime(updatedTime)),
//   getSchedules,
// });
const mapDispatchToProps = {
  setUpdatedTime,
  getSchedules,
  setAppStatus,
  setScheduleUpdated,
  syncUploadQueue,
  setReminder,
  cancelReminder,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ActivityList);
