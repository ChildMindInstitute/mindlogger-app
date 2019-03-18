import moment from 'moment';
import hashInt from 'hash-int';

const dateSortAsc = (date1, date2) => {
  // This is a comparison function that will result in dates being sorted in
  // ASCENDING order. As you can see, JavaScript's native comparison operators
  // can be used to compare dates. This was news to me.
  if (date1 > date2) return 1;
  if (date1 < date2) return -1;
  return 0;
};

function getRandomTime(minTime, maxTime, seed = 123) {
  const max = maxTime - minTime;
  return minTime + Math.floor((hashInt(maxTime + seed) % 1000) / 1000 * max);
}

export const timeArrayFrom = (config, lastDate) => {
  const notifications = {};
  notifications.days = [];
  notifications.times = [];

  const today = new Date(); // Now.

  // Calendar dates
  if (config.calendarDay && Array.isArray(config.calendarDay)) {
    config.calendarDay.forEach((dayStr) => {
      const day = Date.parse(dayStr);
      notifications.days.push(new Date(day));
    });
  }

  // Monthly
  if (config.modeMonth && config.monthDay && config.monthDay.length) {
    const todayDate = today.getDate(); // Today's day of the month.
    config.monthDay.forEach((day) => {
      if (todayDate < day) {
        const date = today.getMonth() === 11
          ? new Date(today.getFullYear() + 1, 0, day)
          : new Date(today.getFullYear(), today.getMonth() + 1, day);
        notifications.days.push(date);
      } else {
        const date = new Date(today.getFullYear(), today.getMonth(), day);
        notifications.days.push(date);
      }
    });
  }

  // Weekly
  if (config.modeWeek && config.weekDay && config.weekDay.length) {
    const todayDay = today.getDay(); // Today's day of the week.
    config.weekDay.forEach((day) => {
      // Get the appropriate weekday this week unless that day is today or
      // earlier, in which case get next week.
      const aftermorrows = [day - todayDay + (day < todayDay ? 7 : 0)];

      // Calculate 5 weeks of days
      for (let plusDays = 0; aftermorrows[plusDays] <= 28; plusDays += 1) {
        aftermorrows.push(aftermorrows[plusDays] + 7); // The following x-day.
      }

      aftermorrows.forEach((afterday) => {
        // Date object to mutate.
        const dateAssign = new Date(today);

        // Calculate date of future assignments
        dateAssign.setTime(dateAssign.getTime() + afterday * 86400000);

        // Push assignment date to Array.
        notifications.days.push(dateAssign);
      });
    });
  }

  if (config.times && config.times.length > 0) {
    const n = config.times.length;
    for (let index = 0; index < n; index += 1) {
      const dayTime = config.times[index];
      if (dayTime.timeMode === 'scheduled' && dayTime.time) {
        const t = moment(dayTime.time, 'HH:mm');
        if (t.isValid()) {
          notifications.times.push(t.toDate());
        }
      } else if (dayTime.timeMode === 'random' && dayTime.timeStart && dayTime.timeEnd) {
        const t1 = moment(dayTime.timeStart, 'HH:mm');
        const t2 = moment(dayTime.timeEnd, 'HH:mm');
        if (t1.isValid() && t2.isValid()) {
          const d = new Date(getRandomTime(t1, t2, index));
          notifications.times.push(d);
        }
      }
    }
  }

  notifications.compiled = []; // Compile calculated dates with calculated times
  const startTime = lastDate || Date.now();
  notifications.days.forEach((day) => {
    notifications.times.forEach((time) => {
      const scheduledTime = new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
        time.getHours(),
        time.getMinutes(),
        time.getSeconds(),
      );
      if (notifications.compiled.findIndex(x => x.valueOf() === scheduledTime.valueOf()) === -1) {
        if (scheduledTime.getTime() > startTime) {
          notifications.compiled.push(scheduledTime);
        }
      }
    });
  });
  notifications.compiled.sort(dateSortAsc); // Sort compiled datetimes chronologically
  return notifications.compiled;
};
