var date_sort_asc = function (date1, date2) {
  // This is a comparison function that will result in dates being sorted in
  // ASCENDING order. As you can see, JavaScript's native comparison operators
  // can be used to compare dates. This was news to me.
  if (date1 > date2) return 1;
  if (date1 < date2) return -1;
  return 0;
};


updateNotifications(userActVersion) {
  let notifications = {};
  notifications.days = [];
  notifications.times = [];
  let today = new Date(); // Now.
  if (userActVersion.meta.userNotifications.scheduleType.calendar && userActVersion.meta.userNotifications.scheduleType.calendar.length) {
    userActVersion.meta.userNotifications.scheduleType.calendar.forEach(function(day) {
      day>=today ? notifications.days.push(day) : null;
    });
  }
  if (userActVersion.meta.userNotifications.scheduleType.monthly && userActVersion.meta.userNotifications.scheduleType.monthly.length) {
    todayDate = today.getDate(); // Today's day of the month.
    userActVersion.meta.userNotifications.scheduleType.monthly.forEach(function(day) {
      notifications.days.push(todayDate<day ? (today.getMonth()===11 ? new Date(today.getFullYear()+1, 0, day) : new Date(today.getFullYear(), today.getMonth()+1, day)) : new Date(today.getFullYear(), today.getMonth(), day));
    });
  }
  if (userActVersion.meta.userNotifications.scheduleType.weekly && userActVersion.meta.userNotifications.scheduleType.weekly.length) {
    todayDay = today.getDay(); // Today's day of the week.
    jsDays = {"Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6};
    userActVersion.meta.userNotifications.scheduleType.weekly.forEach(function(day) {
      if (day.length) {
        let aftermorrows = [jsDays[day] - todayDay + (jsDays[day]<todayDay ? 7 : 0)]; // Get the appropriate weekday this week unless that day is today or earlier, in which case get next week.
        for (var plusDays=0; aftermorrows[plusDays]<=28; plusDays++) { // Calculate 5 weeks of days.
          aftermorrows.push(aftermorrows[plusDays]+7); // The following x-day.
        }
        aftermorrows.forEach(function(afterday){
          let dateAssign = new Date(today); // Date object to mutate.
          dateAssign.setTime(dateAssign.getTime() + afterday * 86400000); // Calculate date of future assignments
          notifications.days.push(dateAssign); // Push assignment date to Array.
        });
      }
    });
  }
}
