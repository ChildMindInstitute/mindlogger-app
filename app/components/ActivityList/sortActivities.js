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
    && activity.lastScheduledTimestamp === null
    && activity.lastResponseTimestamp !== null,
);

export const getScheduled = activityList => activityList.filter(
  activity => activity.nextScheduledTimestamp !== null
    && (
      moment(activity.lastResponseTimestamp) >= moment(activity.lastScheduledTimestamp)
      || activity.lastScheduledTimestamp === null
      || activity.lastResponseTimestamp === null
    ),
);

export const getOverdue = activityList => activityList.filter(
  activity => moment(activity.lastResponseTimestamp) < moment(activity.lastScheduledTimestamp),
);

const addSectionHeader = (array, headerText) => (array.length > 0
  ? [{ isHeader: true, text: headerText }, ...array]
  : []);

const addProp = (key, val, arr) => arr.map(obj => R.assoc(key, val, obj));

// Sort the activities into buckets of "in-progress", "overdue", "scheduled", "unscheduled",
// and "completed". Inject header labels, e.g. "In Progress", before the activities that fit
// into that bucket.
export default (activityList, inProgress) => {
  const inProgressKeys = Object.keys(inProgress);
  const inProgressActivities = activityList.filter(
    activity => inProgressKeys.includes(activity.id),
  );

  const notInProgress = activityList.filter(activity => !inProgressKeys.includes(activity.id));

  // Activities that are scheduled for that time.
  const overdue = getOverdue(notInProgress).sort(compareByTimestamp('lastScheduledTimestamp')).reverse();
  // Should tell the user when it will be activated.
  const scheduled = getScheduled(notInProgress).sort(compareByTimestamp('nextScheduledTimestamp'));
  const unscheduled = getUnscheduled(notInProgress).sort(compareByNameAlpha);
  const completed = getCompleted(notInProgress).reverse();

  return [
    ...addSectionHeader(addProp('status', 'in-progress', inProgressActivities), 'In Progress'),
    ...addSectionHeader(addProp('status', 'overdue', overdue), 'Due'),
    ...addSectionHeader(addProp('status', 'scheduled', scheduled), 'Scheduled'),
    ...addSectionHeader(addProp('status', 'unscheduled', unscheduled), 'Unscheduled'),
    ...addSectionHeader(addProp('status', 'completed', completed), 'Completed'),
  ];
};
