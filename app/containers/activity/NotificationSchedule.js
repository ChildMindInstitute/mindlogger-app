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

function timeFromString(time) {
  if (time.toLowerCase().indexOf("m")+1===time.length) {
    let timeArray = time.substring(0,time.length-2).split(":");
    timeArray[0] = time.substring(time.length-2,time.length-1).toLowerCase()=="p" ? +timeArray[0] + 12 : timeArray[0];
    return new Date(0,0,0,...timeArray);
  }
}

function getRandomTime(minTime, maxTime, seed = 123) {
  min = 0;
  max = maxTime - minTime;
  return minTime + Math.floor((hashInt(maxTime + seed) % 1000) / 1000 * max);
}

export const timeArrayFrom = (config, lastDate) => {
  let notifications = {};
  notifications.days = [];
  notifications.times = [];
  let today = new Date(); // Now.
  if (config.calendarDay && Array.isArray(config.calendarDay)) { // Calendar dates
    config.calendarDay.forEach(function(dayStr) {
      let day = Date.parse(dayStr);
      day>=today ? notifications.days.push(new Date(day)) : null;
    });
  }
  if (config.modeMonth && config.monthDay && config.monthDay.length) { // Monthly
    todayDate = today.getDate(); // Today's day of the month.
    config.monthDay.forEach(function(day) {
      notifications.days.push(todayDate<day ? (today.getMonth()===11 ? new Date(today.getFullYear()+1, 0, day) : new Date(today.getFullYear(), today.getMonth()+1, day)) : new Date(today.getFullYear(), today.getMonth(), day));
    });
  }
  if (config.modeWeek && config.weekDay && config.weekDay.length) { // Weekly
    todayDay = today.getDay(); // Today's day of the week.
    config.weekDay.forEach(function(day) {
      let aftermorrows = [day - todayDay + (day<todayDay ? 7 : 0)]; // Get the appropriate weekday this week unless that day is today or earlier, in which case get next week.
      for (var plusDays=0; aftermorrows[plusDays]<=28; plusDays++) { // Calculate 5 weeks of days.
        aftermorrows.push(aftermorrows[plusDays]+7); // The following x-day.
      }
      aftermorrows.forEach(function(afterday){
        let dateAssign = new Date(today); // Date object to mutate.
        dateAssign.setTime(dateAssign.getTime() + afterday * 86400000); // Calculate date of future assignments
        notifications.days.push(dateAssign); // Push assignment date to Array.
      });
    });
  }

  if (config.times && config.times.length>0){
    let n = config.times.length
    for (let index = 0; index < n; index++) {
      let step = 1000*3600*24/n;
      let dayTime = config.times[index];
      if (dayTime.timeMode == 'scheduled' && dayTime.time) {
        var t=moment(dayTime.time, "HH:mm");
        if (t.isValid()) {
          notifications.times.push(t.toDate());
        }
      } else if (dayTime.timeMode == 'random' && dayTime.timeStart && dayTime.timeEnd) {
        let t1 = moment(dayTime.timeStart, "HH:mm");
        let t2 = moment(dayTime.timeEnd, "HH:mm");
        if(t1.isValid() && t2.isValid()) {
          let d = new Date(getRandomTime(t1, t2, index));
          notifications.times.push(d);
          console.log("random time", t1,t2, d);
        }
      }
    }
  }
  notifications.compiled = []; // Compile calculated dates with calculated times
  let startTime = lastDate || Date.now();
  notifications.days.forEach(function(day) {
    notifications.times.forEach(function(time) {
      let scheduledTime = new Date(day.getFullYear(), day.getMonth(), day.getDate(), time.getHours(), time.getMinutes(), time.getSeconds());
      if (notifications.compiled.findIndex(function(x) {return x.valueOf()===scheduledTime.valueOf()})===-1){
        if(scheduledTime.getTime() > startTime)
          notifications.compiled.push(scheduledTime);
      }
    });
  });
  notifications.compiled.sort(dateSortAsc); // Sort compiled datetimes chronologically
  return notifications.compiled; // Return the notification schedule
}
