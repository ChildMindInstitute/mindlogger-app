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

export default (activityList) => {
  const overdue = getOverdue(activityList).sort(sortBy('lastScheduledTimestamp')).reverse();
  const scheduled = getScheduled(activityList).sort(sortBy('nextScheduledTimestamp'));
  const unscheduled = getUnscheduled(activityList).sort(sortActivitiesAlpha);
  const completed = getCompleted(activityList).reverse();

  return [
    ...addSectionHeader(overdue, 'Overdue'),
    ...addSectionHeader(scheduled, 'Scheduled'),
    ...addSectionHeader(unscheduled, 'Unscheduled'),
    ...addSectionHeader(completed, 'Completed'),
  ];
};
