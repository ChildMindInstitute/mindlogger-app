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

export default (activityList, inProgress) => {
  const inProgressKeys = Object.keys(inProgress);
  const inProgressActivities = inProgressKeys.map(key => inProgress[key].activity);
  const notInProgress = activityList.filter(activity => !inProgressKeys.includes(activity._id));
  const overdue = getOverdue(notInProgress).sort(sortBy('lastScheduledTimestamp')).reverse();
  const scheduled = getScheduled(notInProgress).sort(sortBy('nextScheduledTimestamp'));
  const unscheduled = getUnscheduled(notInProgress).sort(sortActivitiesAlpha);
  const completed = getCompleted(notInProgress).reverse();

  return [
    ...addSectionHeader(inProgressActivities, 'In Progress'),
    ...addSectionHeader(overdue, 'Overdue'),
    ...addSectionHeader(scheduled, 'Scheduled'),
    ...addSectionHeader(unscheduled, 'Unscheduled'),
    ...addSectionHeader(completed, 'Completed'),
  ];
};
