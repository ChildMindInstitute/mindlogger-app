import * as R from 'ramda';
import moment from 'moment';
import i18n from 'i18next';


const compareByTimestamp = propName => (a, b) => moment(a[propName]) - moment(b[propName]);

export const getUnscheduled = (
  activityList,
  actualActivities,
  scheduledActivities,
  finishedEvents,
  scheduleData
) => {
  const unscheduledActivities = [];

  for (const activity of activityList) {
    if (!activity.events.length) {
      unscheduledActivities.push({ ...activity });
      continue;
    }

    let actStatus = false;
    let selectedEvent = null;
    let todayEvents = scheduleData[Object.keys(scheduleData)[0]];

    for (const event of activity.events) {
      const { data, id } = event;
      let currentEvent = todayEvents.find((event) => event.id === id);

      if (
        Object.keys(finishedEvents).includes(id) ||
        (currentEvent && !currentEvent.valid)
      ) {
        actStatus = false;
        break;
      }

      if (
        !scheduledActivities.find(({ schema }) => schema === activity.schema) &&
        !actualActivities.find(({ schema }) => schema === activity.schema) &&
        !unscheduledActivities.find(({ schema }) => schema === activity.schema)
      ) {
        actStatus = true;
        selectedEvent = event;
      }
    }

    if (actStatus) {
      unscheduledActivities.push({
        ...activity,
        event: selectedEvent,
      });
    }
  }

  return unscheduledActivities;
};

export const getScheduled = (activityList, finishedEvents) => {
  const scheduledActivities = [];
  const finishedEventsKeys = finishedEvents ? Object.keys(finishedEvents) : [];

  activityList.forEach(activity => {
    activity.events.forEach(event => {
      const today = new Date();
      const { scheduledTime, data } = event;
      
      const activityNotAvailable = !activity.availability;
      const eventScheduledInFuture = scheduledTime > today;
      const completionFalseInEventData = !data.completion;
      const isTimeoutAccessInEventData = data.timeout.access;
      const eventScheduledToday = moment().isSame(moment(scheduledTime), 'day');

      const eventIdNotInFinishedKeys = !finishedEventsKeys.includes(event.id);
      
      let finishedEventDayIsNotToday;

      if (!eventIdNotInFinishedKeys) {
        const currentFinishedEvent = finishedEvents[event.id];
        const finishedEventDate = new Date(currentFinishedEvent);
        finishedEventDayIsNotToday = !moment().isSame(moment(finishedEventDate), 'day');
      }

      if (activityNotAvailable
        && eventScheduledInFuture
        && completionFalseInEventData
        && (isTimeoutAccessInEventData || eventScheduledToday) 
        && (eventIdNotInFinishedKeys || finishedEventDayIsNotToday)) {
        
        const scheduledActivity = { ...activity };
        delete scheduledActivity.events;

        scheduledActivity.event = event;
        scheduledActivities.push(scheduledActivity);
      }
    })
  });

  return scheduledActivities;
}

export const getActual = (activityList, finishedEvents) => {
  const resultActivities = [];

  activityList.forEach((activity) => {
    activity.events.forEach((event) => {
      const now = new Date();

      const { scheduledTime, data } = event;

      const secondsPerDay = 864000;
      const secondsPerHour = 3600;
      const secondsPerMinute = 60;

      const activityDuration =
        data.timeout.day * secondsPerDay * 1000 +
        data.timeout.hour * secondsPerHour * 1000 +
        data.timeout.minute * secondsPerMinute * 1000;

      const alwaysAvailableSetInEvent = activity.availability;

      const scheduledTimeInMs = scheduledTime?.getTime() ?? 0;
      const scheduledTimeIsToday = scheduledTime
        ? moment().isSame(moment(scheduledTime), "day")
        : false;

      const finishedEventsIncludeEventIdKey = Object.keys(
        finishedEvents
      ).includes(event.id);
      const eventFinishedAt = finishedEvents[event.id];
      const eventFinishedAtMoment = eventFinishedAt
        ? moment(new Date(eventFinishedAt))
        : null;
      const eventFinishedToday = eventFinishedAtMoment
        ? moment().isSame(eventFinishedAtMoment, "day")
        : false;

      const scheduledTimeAndNowDiff = now.getTime() - scheduledTime.getTime();

      const isInAllowedTimeWindowOrCheckNotNeeded =
        !data.timeout.allow || scheduledTimeAndNowDiff < activityDuration;

      const notCompletedOrCompletedInPreviousDays =
        !finishedEventsIncludeEventIdKey || !eventFinishedToday;

      if (alwaysAvailableSetInEvent) {
        if (
          !data.completion ||
          !eventFinishedAt ||
          eventFinishedAt < scheduledTimeInMs
        ) {
          const resultActivity = { ...activity };

          delete resultActivity.events;
          resultActivity.event = event;
          resultActivities.push(resultActivity);
        }
      } else {
        if (
          scheduledTime <= now &&
          scheduledTimeIsToday &&
          isInAllowedTimeWindowOrCheckNotNeeded &&
          notCompletedOrCompletedInPreviousDays
        ) {
          const resultActivity = { ...activity };

          delete resultActivity.events;
          resultActivity.event = event;
          resultActivities.push(resultActivity);
        }
      }
    });
  });

  return resultActivities;
};

const filterTodaysButOutOfTimeWindow = (activities) => {
  const result = [];
  const now = new Date();

  const secondsPerDay = 864000;
  const secondsPerHour = 3600;
  const secondsPerMinute = 60;

  for (let activity of activities) {
    let outOfWindow = false;

    if (activity.event) {
      const { scheduledTime, data } = activity.event;

      const scheduledTimeIsToday = scheduledTime
        ? moment().isSame(moment(scheduledTime), "day")
        : false;

      const activityDuration =
        data.timeout.day * secondsPerDay * 1000 +
        data.timeout.hour * secondsPerHour * 1000 +
        data.timeout.minute * secondsPerMinute * 1000;

      const scheduledTimeAndNowDiff = now.getTime() - scheduledTime.getTime();

      const isOutOfAllowedTimeWindow =
        data.timeout.allow && scheduledTimeAndNowDiff > activityDuration;

      if (scheduledTimeIsToday && isOutOfAllowedTimeWindow) {
        outOfWindow = true;
      }
    }

    if (!outOfWindow) {
      result.push(activity);
    }
  }

  return result;
};

const addSectionHeader = (array, headerText) => {
  if (array.length > 0) {
    return [{ isHeader: true, text: headerText }, ...array];
  } else {
    return [];
  }
};

const addProp = (key, val, arr) => arr.map(obj => R.assoc(key, val, obj));

// into categories
const sortActivities = (activityList, inProgress, finishedEvents, scheduleData) => {
  let notInProgressActivities = [];
  let inProgressActivities = [];

  const inProgressKeys = Object.keys(inProgress);

  if (!inProgressKeys) {
    notInProgressActivities = activityList;
  }

  if (inProgressKeys) {
    const activitiesWithEvents = activityList.filter(activity => activity.events.length);
    const activitiesWithoutEvents = activityList.filter(activity => !activity.events.length)

    activitiesWithEvents.forEach(activity => {
      const inProgressEvents = [];
      const notInProgressEvents = [];

      activity.events.forEach(event => {
        const hasKey = inProgressKeys.includes(activity.id + event.id);        
        if (hasKey) {
          inProgressEvents.push(event);
        } else {
          notInProgressEvents.push(event);
        }
      });

      if(inProgressEvents.length) {
        inProgressEvents.forEach(event => {
          const inProgressActivity = {
            ...activity,
            event,
          };
          inProgressActivities.push(inProgressActivity);
        })
      }

      if (notInProgressEvents.length) {
        const notInProgressActivity = {
          ...activity,
          events: notInProgressEvents,
        };
        notInProgressActivities.push(notInProgressActivity);
      }
    })

    activitiesWithoutEvents.forEach(activity => {
      const activityClone = { ...activity };
      const hasKey = inProgressKeys.includes(activity.id);

      if (hasKey) {
        inProgressActivities.push(activityClone);
      } else {
        notInProgressActivities.push(activityClone);
      }
    })
  }

  // Activities scheduled today and in allowed time period or period not set
  // Activities scheduled in the future day with set always-available flag.
  // They should not be completed in schedule day
  const actual = getActual(notInProgressActivities, finishedEvents)
    .sort(compareByTimestamp('lastScheduledTimestamp'))
    .reverse();

  const scheduled = getScheduled(notInProgressActivities, finishedEvents).sort(compareByTimestamp('nextScheduledTimestamp'));
  
  let unscheduled = getUnscheduled(notInProgressActivities, actual, scheduled, finishedEvents, scheduleData);
  unscheduled = filterTodaysButOutOfTimeWindow(unscheduled);
  
  const inProgressWithProp = addProp('status', 'in-progress', inProgressActivities);

  const inProgressWithHeader = addSectionHeader(
    inProgressWithProp,
    i18n.t('additional:in_progress'),
  );

  const pastDueWithProp = addProp('status', 'pastdue', actual);

  const unscheduledWithProp = addProp('status', 'unscheduled', unscheduled);

  const pastDueAndUnscheduledWithHeader = addSectionHeader(
    [
      ...pastDueWithProp,
      ...unscheduledWithProp
    ],
    i18n.t('additional:available')
  );

  const scheduledWithProp = addProp('status', 'scheduled', scheduled);

  const scheduledWithHeader = addSectionHeader(scheduledWithProp, i18n.t('additional:scheduled'));

  const result = [
    ...inProgressWithHeader,
    ...pastDueAndUnscheduledWithHeader,
    ...scheduledWithHeader
  ];
  return result;
};

export default sortActivities