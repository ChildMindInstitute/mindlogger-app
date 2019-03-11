import moment from 'moment';

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

export const getLastScheduledCalendarDates = (now, calendarDayAr) => {
  const calendarDays = calendarDayAr.map(day => moment(day));
  return calendarDays.filter(day => day.isSameOrBefore(now));
};

export const getUpcomingScheduledCalendarDates = (now, calendarDayAr) => {
  const calendarDays = calendarDayAr.map(day => moment(day));
  return calendarDays.filter(day => day.isAfter(now));
};

export const getLastScheduledMonthDays = (now, monthDayAr) => {
  const current = now.date();
  return monthDayAr.map((monthDay) => {
    const dayDifference = current - monthDay;
    const nowStart = now.clone().startOf('day');
    if (monthDay <= current) {
      return nowStart.subtract(dayDifference, 'days');
    }
    return nowStart.subtract(1, 'month').subtract(dayDifference, 'days');
  });
};

export const getUpcomingScheduledMonthDays = (now, monthDayAr) => {
  const current = now.date();
  return monthDayAr.map((monthDay) => {
    const dayDifference = monthDay - current;
    const nowStart = now.clone().startOf('day');
    if (monthDay > current) {
      return nowStart.add(dayDifference, 'days');
    }
    return nowStart.add(1, 'month').add(dayDifference, 'days');
  });
};

export const getLastScheduledWeekdays = (now, weekdayAr) => {
  const current = now.day();
  return weekdayAr.map((weekday) => {
    const dayDifference = current - weekday;
    const nowStart = now.clone().startOf('day');
    if (weekday <= current) {
      return nowStart.subtract(dayDifference, 'days');
    }
    return nowStart.subtract(1, 'week').subtract(dayDifference, 'days');
  });
};

export const getUpcomingScheduledWeekdays = (now, weekdayAr) => {
  const current = now.day();
  return weekdayAr.map((weekday) => {
    const dayDifference = weekday - current;
    const nowStart = now.clone().startOf('day');
    if (weekday > current) {
      return nowStart.add(dayDifference, 'days');
    }
    return nowStart.add(1, 'week').add(dayDifference, 'days');
  });
};

export const getLastScheduledTime = (activity) => {
  const latestDates = [];
  const now = moment();

  if (activity.meta.notification.modeWeek) {
    const last = getLastScheduledWeekdays(now, activity.meta.notification.weekDay);
    latestDates.push(...last);
  }

  if (activity.meta.notification.modeMonth) {
    const last = getLastScheduledMonthDays(now, activity.meta.notification.monthDay);
    latestDates.push(...last);
  }

  if (activity.meta.notification.modeDate) {
    const last = getLastScheduledCalendarDates(now, activity.meta.notification.calendarDay);
    latestDates.push(...last);
  }

  if (latestDates.length > 0) {
    return sortMomentAr(latestDates).pop().valueOf();
  }
  return null;
};

export const getNextScheduledTime = (activity) => {
  const upcomingDates = [];
  const now = moment();

  if (activity.meta.notification.modeWeek) {
    const upcoming = getUpcomingScheduledWeekdays(now, activity.meta.notification.weekDay);
    upcomingDates.push(...upcoming);
  }

  if (activity.meta.notification.modeMonth) {
    const upcoming = getUpcomingScheduledMonthDays(now, activity.meta.notification.monthDay);
    upcomingDates.push(...upcoming);
  }

  if (activity.meta.notification.modeDate) {
    const upcoming = getUpcomingScheduledCalendarDates(now, activity.meta.notification.calendarDay);
    upcomingDates.push(...upcoming);
  }

  if (upcomingDates.length > 0) {
    return sortMomentAr(upcomingDates)[0].valueOf();
  }
  return null;
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
