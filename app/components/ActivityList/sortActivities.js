import * as R from 'ramda';
import moment from 'moment';

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

export const getUnscheduled = activityList => activityList.filter(
  activity => activity.nextScheduledTimestamp === null
    && activity.lastScheduledTimestamp === null
    && activity.lastResponseTimestamp === null,
);

export const getCompleted = activityList => activityList.filter(
  activity => activity.nextScheduledTimestamp === null
    && activity.lastResponseTimestamp !== null
    && activity.lastScheduledTimestamp === null,
);

export const getScheduled = activityList => activityList.filter(
  activity => activity.nextScheduledTimestamp !== null
    && (moment().isSame(moment(activity.nextScheduledTimestamp), 'day'))
    && (moment() <= moment(activity.nextScheduledTimestamp)),
);

export const getOverdue = activityList => activityList.filter(
  activity => activity.lastScheduledTimestamp !== null
    && (activity.lastResponseTimestamp === null || moment(activity.lastResponseTimestamp) < moment(activity.lastScheduledTimestamp)),
);

const addSectionHeader = (array, headerText) => (array.length > 0
  ? [{ isHeader: true, text: headerText }, ...array]
  : []);

const addProp = (key, val, arr) => arr.map(obj => R.assoc(key, val, obj));

// Sort the activities into categories and inject header labels, e.g. "In Progress",
// before the activities that fit into that category.
export default (activityList, inProgress) => {
  const inProgressKeys = Object.keys(inProgress);
  const inProgressActivities = activityList.filter(
    activity => inProgressKeys.includes(activity.id),
  );

  const notInProgress = activityList.filter(activity => !inProgressKeys.includes(activity.id));

  // Activities currently scheduled - or - previously scheduled and not yet completed.
  const overdue = getOverdue(notInProgress).sort(compareByTimestamp('lastScheduledTimestamp')).reverse();

  // Activities scheduled some time in the future.
  const scheduled = getScheduled(notInProgress).sort(compareByTimestamp('nextScheduledTimestamp'));

  // Activities with no schedule.
  const unscheduled = getUnscheduled(notInProgress).sort(compareByNameAlpha);

  // Activities which have been completed and have no more scheduled occurrences.
  const completed = getCompleted(notInProgress).reverse();

  return [
    ...addSectionHeader(addProp('status', 'in-progress', inProgressActivities), 'In Progress'),
    ...addSectionHeader(addProp('status', 'unscheduled', unscheduled), 'Unscheduled'),
    ...addSectionHeader(addProp('status', 'completed', completed), 'Completed'),
    ...addSectionHeader(addProp('status', 'scheduled', scheduled), 'Scheduled'),
    ...addSectionHeader(addProp('status', 'overdue', overdue), 'Due'),
  ];
};