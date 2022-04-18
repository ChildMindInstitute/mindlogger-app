// Third-party libraries.
import React, { useState, useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import _ from 'lodash';

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
import { setActivities } from '../../state/activities/activities.actions';
import { setScheduleUpdated } from '../../state/applets/applets.actions';
import {
  inProgressSelector,
} from '../../state/responses/responses.selectors';

import { parseAppletEvents } from '../../models/json-ld';
import { getAvailableActivities } from '../../services/helper';
import LiveConnection from './LiveConnection';

const ActivityList = ({
  applet,
  activities,
  syncUploadQueue,
  appStatus,
  setConnection,
  setReminder,
  cancelReminder,
  scheduleUpdated,
  isConnected,
  setScheduleUpdated,
  inProgress,
  setActivities,
  finishedEvents,
  onPressActivity,
  onLongPressActivity,
  cumulativeActivities
}) => {
  const [prizeActivity, setPrizeActivity] = useState(null);
  const updateStatusDelay = 60 * 1000;
  let currentConnection = false;

  const stateUpdate = async () => {
    const newApplet = parseAppletEvents(applet);
    const pzActs = newApplet.activities.filter(act => act.isPrize === true)

    const convertToIndexes = (activities) => (activities || [])
      .map(id => {
        const index = newApplet.activities.findIndex(activity => activity.id.split('/').pop() == id)
        return index;
      })
      .filter(index => index > -1)

    let appletActivities = getAvailableActivities(
      newApplet.activities,
      convertToIndexes(cumulativeActivities[applet.id].available),
      convertToIndexes(cumulativeActivities[applet.id].archieved),
    );

    appletActivities = appletActivities
      .map(index => newApplet.activities[index])
      .filter(
        activity =>
          activity.isPrize != true &&
          !activity.isVis && activity.isReviewerActivity != true
      )

    setActivities(_.uniqBy(sortActivities(appletActivities, inProgress, finishedEvents, applet.schedule.data), "id"));

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

  const isMounted = useRef(false), timers = useRef([])

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false }
  }, []);

  useEffect(() => {
    stateUpdate();
    const leftTime = (60 - new Date().getSeconds()) * 1000;

    if (isMounted.current) {
      timers.current.push(delayedExec(
        () => {
          if (isMounted.current) {
            stateUpdate();
            timers.current.push(delayedExec(stateUpdate, { every: updateStatusDelay }));
          }
        },
        { after: leftTime },
      ));
    }

    return () => {
      while (timers.current.length) {
        clearExec(timers.current[0])
        timers.current.shift()
      }
    }
  }, [Object.keys(inProgress).length, applet]);

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

  const getRecomendedActivity = (activityId) => {
    const availableCumulativeActivities = cumulativeActivities[applet.id]?.available;
    return availableCumulativeActivities?.length &&
      availableCumulativeActivities[availableCumulativeActivities?.length - 1] === activityId?.split('/').pop()
  }

  return (
    <View style={{ paddingBottom: 30 }}>
      {
        applet.streamEnabled && <LiveConnection applet={applet} /> || <></>
      }

      {activities && activities.map(activity => (
        <ActivityListItem
          disabled={activity.status === 'scheduled' && !activity.event.data.timeout.access}
          onPress={() => onPressActivity(activity)}
          onLongPress={() => onLongPressActivity(activity)}
          activity={activity}
          isRecommended={getRecomendedActivity(activity.id)}
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
    activityAccess: activityAccessSelector(state),
    inProgress: inProgressSelector(state),
    finishedEvents: finishedEventsSelector(state),
    activities: state.activities.activities,
    cumulativeActivities: state.activities.cumulativeActivities,
  };
};

const mapDispatchToProps = {
  setUpdatedTime,
  getSchedules,
  setAppStatus,
  setConnection,
  setScheduleUpdated,
  syncUploadQueue,
  setReminder,
  cancelReminder,
  setActivities
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ActivityList);
