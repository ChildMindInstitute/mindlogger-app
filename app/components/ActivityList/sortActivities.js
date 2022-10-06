import * as R from 'ramda';
import moment from 'moment';
import i18n from 'i18next';


const compareByTimestamp = propName => (a, b) => moment(a[propName]) - moment(b[propName]);

export const getUnscheduled = (
  activityList,
  pastActivities,
  scheduledActivities,
  finishedEvents,
  scheduleData,
) => {
  const unscheduledActivities = [];

  for (const activity of activityList) {
    if (!activity.events.length) {
      unscheduledActivities.push({ ...activity });
    } else {
      let actStatus = false;
      let selectedEvent = null;
      let todayEvents = scheduleData[Object.keys(scheduleData)[0]];

      for (const event of activity.events) {
        const { data, id } = event;
        let currentEvent = todayEvents.find((event) => event.id === id);

        if (Object.keys(finishedEvents).includes(id)
          || (currentEvent && !currentEvent.valid)) {
          actStatus = false;
          break;
        }

        if (!scheduledActivities.find(({ schema }) => schema === activity.schema)
          && !pastActivities.find(({ schema }) => schema === activity.schema)
          && !unscheduledActivities.find(({ schema }) => schema === activity.schema)
        ) {
          actStatus = true;
          selectedEvent = event;
        }
      }

      if (actStatus) {
        unscheduledActivities.push({
          ...activity,
          event: selectedEvent
        });
      }
    }
  }

  return unscheduledActivities;
}

export const getScheduled = (activityList, finishedEvents) => {
  const scheduledActivities = [];
  const finishedEventsKeys = Object.keys(finishedEvents);

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

export const getPastdue = (activityList, finishedEvents) => {
  const pastActivities = [];

  activityList.forEach(activity => {
    activity.events.forEach(event => {
      const today = new Date();
      const { scheduledTime, data } = event;
      const activityTimeout = data.timeout.day * 864000000
        + data.timeout.hour * 3600000
        + data.timeout.minute * 60000;

      if (activity.availability) {
        if (!data.completion
          || !finishedEvents[event.id]
          || scheduledTime.getTime() > finishedEvents[event.id]) {
            const pastActivity = { ...activity };

            delete pastActivity.events;
            pastActivity.event = event;
            pastActivities.push(pastActivity);
        }
      } else if (!activity.availability
        && scheduledTime <= today
        && (!Object.keys(finishedEvents).includes(event.id) || !moment().isSame(moment(new Date(finishedEvents[event.id])), 'day'))
        && moment().isSame(moment(scheduledTime), 'day')
        && (!data.timeout.allow || today.getTime() - scheduledTime.getTime() < activityTimeout)) {
        const pastActivity = { ...activity };

        delete pastActivity.events;
        pastActivity.event = event;
        pastActivities.push(pastActivity);
      }
    })
  });

  return pastActivities;
}

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

  // Activities currently scheduled - or - previously scheduled and not yet completed.
  // Activities scheduled some time in the future.
  const pastdue = getPastdue(notInProgressActivities, finishedEvents)
    .sort(compareByTimestamp('lastScheduledTimestamp'))
    .reverse();

  const scheduled = getScheduled(notInProgressActivities, finishedEvents).sort(compareByTimestamp('nextScheduledTimestamp'));
  
  // Activities with no schedule.
  const unscheduled = getUnscheduled(notInProgressActivities, pastdue, scheduled, finishedEvents, scheduleData);
  
  const inProgressWithProp = addProp('status', 'in-progress', inProgressActivities);

  const inProgressWithHeader = addSectionHeader(
    inProgressWithProp,
    i18n.t('additional:in_progress'),
  );

  const pastDueWithProp = addProp('status', 'pastdue', pastdue);

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