import moment from 'moment';
import * as R from 'ramda';

const COVER_DAY = true;
const TIMED_EVENTS = true;

export const getStartOfInterval = R.pathOr(null, [0, 'start', 'date']);

export const NOTIFICATION_DATETIME_FORMAT = 'YYYYMMDD HH:mm';

export const formatTime = (timestamp) => {
  const time = moment(timestamp);
  if (moment().isSame(time, 'day')) {
    return moment(timestamp).format('[Today at] h:mm A');
  }
  return moment(timestamp).format('MMMM D');
};

export const scheduledTime = (timestamp) => {
  const time = moment(timestamp);
  if (moment().isSame(time, 'day')) {
    return moment(timestamp).format('h:mm A');
  }
  return null;
};

export const scheduledEndTime = (timestamp, timeout) => {
  const time = moment(timestamp);

  if (timeout === 86340000) {
    if (moment().isSame(time, 'day')) {
      return time.set({ hour: 23, minute: 59 }).format('h:mm A');
    }
    return null;
  }
  if (moment().isSame(time, 'day')) {
    return time.add(timeout, 'milliseconds').format('h:mm A');
  }
  return null;
};

export const convertDateString = (str) => {
  if (str == '12:00 PM') {
    return 'Noon';
  }
  if (str == '11:59 PM') {
    return 'Midnight';
  }

  return str;
}

export const lastScheduledTime = (timestamp) => {
  if (timestamp) {
    return moment(timestamp).format('h:mm A');
  }
  return null;
};

export const lastScheduledEndTime = (timestamp, timeout) => {
  const time = moment(timestamp);

  if (!timestamp) {
    return null;
  }

  if (timeout === 86340000) {
    return time.set({ hour: 23, minute: 59 }).format('h:mm A');
  }
  return time.add(timeout, 'milliseconds').format('h:mm A');
};

// Generates a list of timestamps for when local notifications should be triggered,
// reminding the user to complete their activities. Notification times are set in the
// admin panel alongside the schedule for each activity.
export const getScheduledNotifications = (
  eventSchedule,
  now,
  notifications,
) => {
  const dates = eventSchedule
    .forecast(now, COVER_DAY, 4, 0)
    .map(d => d[2])
    .array();
  const dateTimes = [];

  dates.forEach((date) => {
    notifications.forEach((n) => {
      // TODO: handle randomized notifiation times
      // i.e. if n.random is true generate notification time between n.start and n.end
      const timestamp = moment(
        `${date[2]} ${n.start}`,
        NOTIFICATION_DATETIME_FORMAT,
      );
      // The dayspan library can return dates from the past when projecting next dates,
      // so let's filter those out.
      if (timestamp.isAfter(moment(now.date))) {
        dateTimes.push(timestamp);
      }
    });
  });

  return dateTimes;
};

// Find the last event scheduled for before (or including) now.
export const getLastScheduled = (eventSchedule, now) => {
  const pastSchedule = eventSchedule.forecast(
    now,
    COVER_DAY,
    0,
    2,
    TIMED_EVENTS,
  );
  const pastDays = pastSchedule.array().filter((event) => {
    // Include only events that started before now.
    return moment(getStartOfInterval(event)).isBefore(now.date);
  });
  const mostRecentLast = R.last(pastDays);
  return getStartOfInterval(mostRecentLast);
};

// Find the immediately next scheduled event.
export const getNextScheduled = (eventSchedule, now) => {
  const futureSchedule = eventSchedule.forecast(
    now,
    COVER_DAY,
    1,
    0,
    TIMED_EVENTS,
  );
  const nextDays = futureSchedule.array().filter((event) => {
    // Include only events that start after now.
    return moment(getStartOfInterval(event)).isAfter(now.date);
  });
  const earliestNext = R.head(nextDays);
  return getStartOfInterval(earliestNext);
};
