import moment from 'moment';
import * as R from 'ramda';

// TO DO: Add support for activities becoming due at specific times during the day.
// The Implementation below assumes all dates start at midnight

export const sortMomentAr = momentAr => momentAr.sort((a, b) => {
  if (a.isBefore(b)) {
    return -1;
  }
  if (b.isBefore(a)) {
    return 1;
  }
  return 0;
});

export const getScheduledCalendarDates = (activity, start) => {
  if (R.path(['meta', 'notification', 'modeDate'], activity)) {
    const calendarDayAr = activity.meta.notification.calendarDay;
    return calendarDayAr.map(day => moment(day))
      .filter(day => day.isSameOrAfter(start));
  }
  return [];
};

export const getScheduledMonthDays = (activity, start, end) => {
  if (R.path(['meta', 'notification', 'modeMonth'], activity)) {
    const monthDayAr = activity.meta.notification.monthDay;
    const index = start.clone();
    const accumulator = [];
    // Step through the search period
    while (index.isBefore(end)) {
      if (monthDayAr.includes(index.date())) {
        accumulator.push(index.clone());
      }
      index.add(1, 'day');
    }
    return accumulator;
  }
  return [];
};

export const getScheduledWeekDays = (activity, start, end) => {
  if (R.path(['meta', 'notification', 'modeWeek'], activity)) {
    const weekDayAr = activity.meta.notification.weekDay;
    const index = start.clone();
    const accumulator = [];
    // Step through the search period
    while (index.isBefore(end)) {
      if (weekDayAr.includes(index.day())) {
        accumulator.push(index.clone());
      }
      index.add(1, 'day');
    }
    return accumulator;
  }
  return [];
};

export const getScheduledDates = (activity, start, end) => sortMomentAr([
  ...getScheduledCalendarDates(activity, start),
  ...getScheduledMonthDays(activity, start, end),
  ...getScheduledWeekDays(activity, start, end),
]);

export const getDateTimes = (dates, timeAr) => {
  // If no times been set, default to 9:00 AM
  const defaultTime = { time: '09:00', timeMode: 'scheduled' };
  const safeTimeAr = timeAr.length === 0 ? [defaultTime] : timeAr;

  const dateTimes = safeTimeAr.reduce((acc, time) => {
    const parsedTime = moment(time.time, 'HH:mm');
    const currentDateTimes = dates.map(
      date => date.clone()
        .set('hour', parsedTime.get('hour'))
        .set('minute', parsedTime.get('minute'))
        .set('second', 0)
        .set('millisecond', 0),
    );
    return [...acc, ...currentDateTimes];
  }, []);

  return sortMomentAr(dateTimes);
};

export const getScheduledDateTimes = (activity, start, end) => {
  // Get all the scheduled dates
  const dates = getScheduledDates(activity, start, end);

  // Attach times to the scheduled dates (will multiply the total number of
  // scheduled times by the number of scheduled times)
  const times = R.pathOr([], ['meta', 'notification', 'times'], activity)
    .filter(time => time.timeMode === 'scheduled');
  return getDateTimes(dates, times).filter(dateTime => dateTime.isBetween(start, end));
};

export const getNextAndLastTimes = (activity, nowTimestamp) => {
  // Get all the scheduled date/times
  const start = moment(nowTimestamp).subtract(1, 'month');
  const end = moment(nowTimestamp).add(1, 'month');
  const dateTimes = getScheduledDateTimes(activity, start, end);

  // Split up the times based on before and after current time
  const now = moment(nowTimestamp);
  const beforeNow = dateTimes.filter(dateTime => dateTime.isBetween(start, now, null, '[]'));
  const afterNow = dateTimes.filter(dateTime => dateTime.isBetween(now, end, null, '(]'));
  return {
    last: beforeNow.length > 0 ? beforeNow.pop().valueOf() : null,
    next: afterNow.length > 0 ? afterNow[0].valueOf() : null,
  };
};

export const getLastResponseTime = (activity, responses) => {
  const activityResponses = responses[activity._id];

  if (typeof activityResponses === 'undefined') {
    return null; // No responses for that activity
  }

  const lastResponse = activityResponses.reduce(
    (champion, challenger) => (challenger.createdTimestamp > champion.createdTimestamp
      ? challenger
      : champion),
    activityResponses[0],
  );
  return lastResponse.createdTimestamp;
};
