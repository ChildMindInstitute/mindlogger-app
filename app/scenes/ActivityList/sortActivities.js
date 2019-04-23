import * as R from 'ramda';

const sortActivitiesAlpha = (a, b) => {
  const nameA = a.name.toUpperCase(); // ignore upper and lowercase
  const nameB = b.name.toUpperCase(); // ignore upper and lowercase
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
};

const sortBy = propName => (a, b) => a[propName] - b[propName];

export const getUnscheduled = activityList => activityList.filter(
  activity => activity.nextScheduledTimestamp === null
    && activity.lastScheduledTimestamp === null
    && activity.lastResponseTimestamp === null,
);

export const getCompleted = activityList => activityList.filter(
  activity => activity.nextScheduledTimestamp === null
    && activity.lastScheduledTimestamp === null
    && activity.lastResponseTimestamp !== null,
);

export const getScheduled = activityList => activityList.filter(
  activity => activity.nextScheduledTimestamp !== null
    && activity.lastResponseTimestamp >= activity.lastScheduledTimestamp,
);

export const getOverdue = activityList => activityList.filter(
  activity => activity.lastResponseTimestamp < activity.lastScheduledTimestamp,
);

const addSectionHeader = (array, headerText) => (array.length > 0
  ? [{ isHeader: true, text: headerText }, ...array]
  : []);

const addProp = (key, val, arr) => arr.map(obj => R.assoc(key, val, obj));

export default (activityList, inProgress) => {
  const inProgressKeys = Object.keys(inProgress);
  const inProgressActivities = inProgressKeys.map(key => inProgress[key].activity);
  const notInProgress = activityList.filter(activity => !inProgressKeys.includes(activity.id));
  const overdue = getOverdue(notInProgress).sort(sortBy('lastScheduledTimestamp')).reverse();
  const scheduled = getScheduled(notInProgress).sort(sortBy('nextScheduledTimestamp'));
  const unscheduled = getUnscheduled(notInProgress).sort(sortActivitiesAlpha);
  const completed = getCompleted(notInProgress).reverse();

  return [
    ...addSectionHeader(addProp('status', 'in-progress', inProgressActivities), 'In Progress'),
    ...addSectionHeader(addProp('status', 'overdue', overdue), 'Overdue'),
    ...addSectionHeader(addProp('status', 'scheduled', scheduled), 'Scheduled'),
    ...addSectionHeader(addProp('status', 'unscheduled', unscheduled), 'Unscheduled'),
    ...addSectionHeader(addProp('status', 'completed', completed), 'Completed'),
  ];
};
