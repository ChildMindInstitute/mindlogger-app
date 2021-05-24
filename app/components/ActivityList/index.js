// Third-party libraries.
import React, { useState, useEffect } from 'react';
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
  connectionSelector,
  finishedEventsSelector,
  activitySelectionDisabledSelector,
} from '../../state/app/app.selectors';
import { activityAccessSelector } from '../../state/applets/applets.selectors';
import { getSchedules, setReminder, cancelReminder } from '../../state/applets/applets.thunks';
import { syncUploadQueue } from '../../state/app/app.thunks';
import { setUpdatedTime, setAppStatus, setConnection } from '../../state/app/app.actions';
import { setScheduleUpdated } from '../../state/applets/applets.actions';
import {
  responseScheduleSelector,
  inProgressSelector,
} from '../../state/responses/responses.selectors';

import { parseAppletEvents } from '../../models/json-ld';

const ActivityList = ({
  applet,
  syncUploadQueue,
  appStatus,
  setConnection,
  setReminder,
  cancelReminder,
  scheduleUpdated,
  isConnected,
  setScheduleUpdated,
  responseSchedule,
  inProgress,
  finishedEvents,
  onPressActivity,
  onLongPressActivity,
}) => {
  // const newApplet = getActivities(applet.applet, responseSchedule);
  const [activities, setActivities] = useState([]);
  const [prizeActivity, setPrizeActivity] = useState(null);
  const updateStatusDelay = 60 * 1000;
  let currentConnection = false;

  const stateUpdate = () => {
    const newApplet = parseAppletEvents(applet);
    const pzActs = newApplet.activities.filter(act => act.isPrize === true)
    const appletActivities = newApplet.activities.filter(act => act.isPrize != true);

    setActivities(sortActivities(appletActivities, inProgress, finishedEvents, applet.schedule.data));

    if (pzActs.length === 1) {
      setPrizeActivity(pzActs[0]);
    }
  };

  const handleConnectivityChange = (connection) => {
    if (connection.isConnected) {
      cancelReminder();

      if (!isConnected && !currentConnection) {
        currentConnection = true;
        setConnection(true);
        syncUploadQueue();
      }
    } else {
      currentConnection = false;
      setConnection(false);
      setReminder();
    }
  }

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
    if (appStatus) {
      stateUpdate();
    }
  }, [appStatus]);

  useEffect(() => {
    if (scheduleUpdated) {
      stateUpdate();
      setScheduleUpdated(false);
    }
  }, [applet.schedule]);

  useEffect(() => {
    const netInfoUnsubscribe = NetInfo.addEventListener(handleConnectivityChange);
    return () => {
      if (netInfoUnsubscribe) {
        netInfoUnsubscribe();
      }
    }
  }, [])

  return (
    <View style={{ paddingBottom: 30 }}>
      {activities.map(activity => (
        <ActivityListItem
          disabled={activity.status === 'scheduled' && !activity.event.data.timeout.access}
          onPress={() => onPressActivity(activity)}
          onLongPress={() => onLongPressActivity(activity)}
          activity={activity}
          key={(activity.event ? activity.id + activity.event.id : activity.id) || activity.text}
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
  setConnection: PropTypes.func.isRequired,
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
  isConnected: PropTypes.bool.isRequired,
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
    isConnected: connectionSelector(state),
    appletTime: state.applets.currentTime,
    activitySelectionDisabled: activitySelectionDisabledSelector(state),
    responseSchedule: responseScheduleSelector(state),
    activityAccess: activityAccessSelector(state),
    inProgress: inProgressSelector(state),
    finishedEvents: finishedEventsSelector(state),

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
  setConnection,
  setScheduleUpdated,
  syncUploadQueue,
  setReminder,
  cancelReminder,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ActivityList);
