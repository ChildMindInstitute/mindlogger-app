import * as R from 'ramda';
import moment from 'moment';
import i18n from 'i18next';

const compareByNameAlpha = (a, b) => {
  const nameA = a.name.en.toUpperCase(); // ignore upper and lowercase
  const nameB = b.name.en.toUpperCase(); // ignore upper and lowercase
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
};

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

  activityList.forEach(activity => {
    activity.events.forEach(event => {
      const today = new Date();
      const { scheduledTime, data } = event;

      if (!activity.availability
        && scheduledTime > today
        && !data.completion
        && (!Object.keys(finishedEvents).includes(event.id) || !moment().isSame(moment(new Date(finishedEvents[event.id])), 'day'))
        && (data.timeout.access || moment().isSame(moment(scheduledTime), 'day'))) {
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

      if (!activity.availability
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

const addSectionHeader = (array, headerText) => (array.length > 0 ? [{ isHeader: true, text: headerText }, ...array] : []);

const addProp = (key, val, arr) => arr.map(obj => R.assoc(key, val, obj));

// Sort the activities into categories and inject header labels, e.g. "In Progress",
// before the activities that fit into that category.
export default (activityList, inProgress, finishedEvents, scheduleData) => {
  let notInProgress = [];
  let inProgressActivities = [];
  const inProgressKeys = Object.keys(inProgress);

  if (inProgressKeys) {
    activityList.forEach(activity => {
      const notInProgressEvents = [];

      if (activity.events.length) {
        activity.events.forEach(event => {
          if (!inProgressKeys.includes(activity.id + event.id)) {
            notInProgressEvents.push(event);
          } else {
            inProgressActivities.push({
              ...activity,
              event,
            });
          }
        });

        if (notInProgressEvents.length) {
          notInProgress.push({
            ...activity,
            events: notInProgressEvents,
          })
        }
      } else {
        if (inProgressKeys.includes(activity.id)) {
          inProgressActivities.push({
            ...activity,
          });
        } else {
          notInProgress.push({ ...activity });
        }
      }
    })
  } else {
    notInProgress = activityList;
  }

  // Activities currently scheduled - or - previously scheduled and not yet completed.

  // Activities scheduled some time in the future.
  const pastdue = getPastdue(notInProgress, finishedEvents)
    .sort(compareByTimestamp('lastScheduledTimestamp'))
    .reverse();

  const scheduled = getScheduled(notInProgress, finishedEvents).sort(compareByTimestamp('nextScheduledTimestamp'));

  // Activities with no schedule.
  const unscheduled = getUnscheduled(notInProgress, pastdue, scheduled, finishedEvents, scheduleData).sort(compareByNameAlpha);

  // Activities which have been completed and have no more scheduled occurrences.
  // const completed = getCompleted(notInProgress).reverse();

  return [
    ...addSectionHeader(addProp('status', 'pastdue', pastdue), i18n.t('additional:past_due')),
    ...addSectionHeader(
      addProp('status', 'in-progress', inProgressActivities),
      i18n.t('additional:in_progress'),
    ),
    ...addSectionHeader(
      addProp('status', 'unscheduled', unscheduled),
      i18n.t('additional:unscheduled'),
    ),
    ...addSectionHeader(addProp('status', 'scheduled', scheduled), i18n.t('additional:scheduled')),
  ];
};
