updateNotifications(userActVersion) {
  let notifications = {};
  notifications.days = [];
  notifications.times = [];
  let today = new Date(); // Now.
  if (userActVersion.meta.userNotifications.scheduleType.calendar && userActVersion.meta.userNotifications.scheduleType.calendar.length) {

  }
  if (userActVersion.meta.userNotifications.scheduleType.monthly && userActVersion.meta.userNotifications.scheduleType.monthly.length) {

  }
  if (userActVersion.meta.userNotifications.scheduleType.weekly && userActVersion.meta.userNotifications.scheduleType.weekly.length) {
    todayDay = today.getDay(); // Today's day of the week.
    jsDays = {"Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6};
    userActVersion.meta.userNotifications.scheduleType.weekly.forEach(function(day) {
      if (day.length) {
        let aftermorrows = [jsDays[day] - todayDay + (jsDays[day] <= todayDay ? 7 : 0)]; // Get the appropriate weekday this week unless that day is today or earlier, in which case get next week.
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
