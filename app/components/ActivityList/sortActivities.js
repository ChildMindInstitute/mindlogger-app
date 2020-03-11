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
    && activity.lastScheduledTimestamp === null,
);

export const getCompleted = activityList => activityList.filter(
  activity => activity.lastResponseTimestamp !== null
    && activity.nextScheduledTimestamp === null
    && (!moment().isSame(moment(activity.lastResponseTimestamp), 'day'))
    && (activity.lastScheduledTimestamp === null || moment(activity.lastResponseTimestamp) > moment(activity.lastScheduledTimestamp)),
);

export const getScheduled = activityList => activityList.filter(
  activity => activity.nextScheduledTimestamp !== null
    && (moment().isSame(moment(activity.nextScheduledTimestamp), 'day'))
    && (moment() <= moment(activity.nextScheduledTimestamp)),
);

export const getPastdue = activityList => activityList.filter(
  activity => activity.lastScheduledTimestamp !== null
    && (new Date().getTime() > activity.lastScheduledTimestamp)
    && (new Date().getTime() - activity.lastScheduledTimestamp < activity.timeout),
);

const addSectionHeader = (array, headerText) => (array.length > 0
  ? [{ isHeader: true, text: headerText }, ...array]
  : []);

const addProp = (key, val, arr) => arr.map(obj => R.assoc(key, val, obj));

// Sort the activities into categories and inject header labels, e.g. "In Progress",
// before the activities that fit into that category.
export default (activityList, inProgress, schedule) => {
  const inProgressKeys = Object.keys(inProgress);
  const inProgressActivities = activityList.filter(
    activity => inProgressKeys.includes(activity.id),
  );
  // console.log('#########', activityList);
  // console.log('%%%%%%%%%', inProgressActivities);

  const notInProgress = inProgressKeys ? activityList.filter(activity => !inProgressKeys.includes(activity.id)) : activityList;
  //console.log('*************', schedule.events);
  // Activities currently scheduled - or - previously scheduled and not yet completed.
  const notprogress = notInProgress.map((obj) => {
    if (schedule.events.length) {
      let event;
      // eslint-disable-next-line no-restricted-syntax
      for (event of schedule.events) {
        if (event.data.URI === obj.schema) {
          const date = new Date(obj.lastScheduledTimestamp).getTime();
          const nextDate = new Date(obj.nextScheduledTimestamp).getTime();

          if (event.schedule.start && event.schedule.end) {
            // if ((nextDate - event.schedule.start) % 86400000 === 0 && nextDate < event.schedule.end) {
            //   return R.assoc('access', event.data.timeout.access, obj);
            // }
            if ((date - event.schedule.start) % 86400000 === 0 && date < event.schedule.end) {
              const milli = (event.data.timeout.day * 24 + event.data.timeout.hour) * 3600000 + event.data.timeout.minute * 60000;
              return R.assoc('timeout', milli, obj);
            }
          } else {
            const thatDay = new Date(event.schedule.year, event.schedule.month, event.schedule.dayOfMonth).getTime();
            let millisecs = thatDay;
            if (event.schedule.times) {
              if (event.schedule.times[0].length === 2) {
                millisecs = +event.schedule.times[0] * 3600000 + thatDay;
              } else {
                const hhMm = event.schedule.times[0].split(':');
                millisecs = ((+hhMm[0]) * 60 + (+hhMm[1])) * 60000 + thatDay;
              }
            }

            // if (millisecs === nextDate) {
            //   return R.assoc('access', event.data.timeout.access, obj);
            // }

            if (millisecs === date) {
              const milli = event.data.timeout ? (event.data.timeout.day * 24 + event.data.timeout.hour) * 3600000 + event.data.timeout.minute * 60000 : 0;
              return R.assoc('timeout', milli, obj);
            }
          }
        }
      }
    }
    return obj;
  });

  // Activities scheduled some time in the future.
  const pastdue = getPastdue(notprogress).sort(compareByTimestamp('lastScheduledTimestamp')).reverse();

  const scheduled = getScheduled(notprogress).sort(compareByTimestamp('nextScheduledTimestamp'));

  // Activities with no schedule.
  const unscheduled = getUnscheduled(notprogress).sort(compareByNameAlpha);

  // Activities which have been completed and have no more scheduled occurrences.
  const completed = getCompleted(notprogress).reverse();

  return [
    ...addSectionHeader(addProp('status', 'pastdue', pastdue), 'Past Due'),
    ...addSectionHeader(addProp('status', 'in-progress', inProgressActivities), 'In Progress'),
    ...addSectionHeader(addProp('status', 'unscheduled', unscheduled), 'Unscheduled'),
    ...addSectionHeader(addProp('status', 'completed', completed), 'Completed'),
    ...addSectionHeader(addProp('status', 'scheduled', scheduled), 'Scheduled'),
  ];
};
