updateNotifications(userActVersion) {
  let notifications = {};
  notifications.days = [];
  notifications.times = [];
  let today = new Date();
  if (userActVersion.meta.userNotifications.scheduleType.calendar && userActVersion.meta.userNotifications.scheduleType.calendar.length) {

  }
  if (userActVersion.meta.userNotifications.scheduleType.monthly && userActVersion.meta.userNotifications.scheduleType.monthly.length) {

  }
  if (userActVersion.meta.userNotifications.scheduleType.weekly && userActVersion.meta.userNotifications.scheduleType.weekly.length) {
    todayDay = today.getDay();
    jsDays = {"Sun": 0, "Mon": 1, "Tues": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6};
    userActVersion.meta.userNotifications.scheduleType.weekly.forEach(day) {
      if (day.length) {
        let dateAssign = new Date(today);
        dateAssign.setTime(dateAssign.getTime() + (jsDays[day] - todayDay + (jsDays[day] <= todayDay ? 7 : 0)) * 86400000);
        notifications.days.push(dateAssign);
      }
    }
  }
}
