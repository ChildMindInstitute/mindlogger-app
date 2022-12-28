import moment from "moment";
import { v4 as uuidv4 } from "uuid";

import { buildExactDateFromUTC } from '../../../utils'

import {
  getActivityPrefixedId,
  getActivityFlowPrefixedId,
  getActivityResponseDateTime,
 } from '../utils'

/*
This module is responsible for creation notification object for an incomming applet.
This object descibes notifications that will be created locally.
Structure of object:
{
  appletId: '123100500',
  appletName: 'applet name #1',
  events: [
    {
      eventId: '456100500',
      eventName: 'event name #1',
      notifications: [
        {
          notificationId: 567100500,
          shortId: 56_500,
          appletId: 34567,
          activityId: '234100500',
          activityFlowId: '345100500',
          eventId: 12345,
          type: 'base',  // 'base' | 'reminder'
          notificationHeader: 'header of notification',
          notificationBody: 'body of notification',
          activityOrFlowName: 'name of activity',
          scheduledAt: 12346543234,
          scheduledAtString: 'Dec 12, 2022, 12:35PM',
          isActive: true, // e.g. if activity passed today -> false
          inactiveReason: "ActivityCompleted" // or Outdated
        }
      ]
    }
  ]
}
*/

const PeriodType = {
  Daily: "Daily",
  Weekly: "Weekly",
  Weekday: "Weekday",
  Monthly: "Monthly",
};

const NotificationType = {
  Base: "Base",
  Reminder: "Reminder",
};

const InactiveReason = {
  ActivityCompleted: "ActivityCompleted",
  ActivityCompletedInReminderInterval: "ActivityCompletedInReminderInterval",
  Outdated: "Outdated",
  ActivityOrFlowHidden: "ActivityOrFlowHidden",
};

const build = (applet, finishedTimes) => {
  if (!applet) {
    throw new Error("[NotificationsBuilder.build] applet is not defined");
  }
  if (!finishedTimes) {
    throw new Error(
      "[NotificationsBuilder.build] finishedTimes is not defined"
    );
  }
  if (!applet.schedule.actual_events) {
    throw new Error(
      "[NotificationsBuilder.build] applet.schedule.actual_events is not defined"
    );
  }

  const result = {
    appletId: getIdBySplit(applet.id),
    appletName: applet.name.en,
    events: [],
  };

  const numberOfDaysForSchedule = 14;

  const firstScheduleDay = moment().startOf("day");

  const lastScheduleDay = moment()
    .startOf("day")
    .add(numberOfDaysForSchedule - 1, "day");

  const today = moment().startOf("day");

  const appletActivityIds = applet.activities.map((a) =>
    a.id ? getIdBySplit(a.id) : 0
  );

  const appletActivityFlowIds = applet.activityFlows.map((a) =>
    a.id ? getIdBySplit(a.id) : 0
  );

  const appletActivityOrFlowIds = [
    ...appletActivityIds,
    ...appletActivityFlowIds,
  ];

  const weekDays = getWeekDays(numberOfDaysForSchedule);

  const processEvent = (eventId) => {
    const eventResult = {
      eventId,
      notifications: [],
    };
    result.events.push(eventResult);

    const event = applet.schedule.actual_events[eventId];

    const { scheduledTime: scheduledTimeString, schedule, data } = event;

    const { activity_id: activityId, activity_flow_id: activityFlowId } = data;

    const isActivityOrFlowHidden = event.isHidden;

    const appletId = getIdBySplit(applet.id);

    if (!appletActivityOrFlowIds.includes(activityId ?? activityFlowId)) {
      console.warn(
        "[buildScheduleNotifications] Applet activities identifiers do not contain event.data.activity_id"
      );
      return;
    }
    if (!scheduledTimeString) {
      return;
    }

    // todo - when time-window of event is set - scheduledTimeDate acquires time
    // it should not affect on any BL, but it's better to check it later and apply startOfDay
    const scheduledTimeDate = new moment(scheduledTimeString);

    let periodStartDay = null,
      periodEndDay = null;

    if (schedule.start) {
      periodStartDay = moment(
        buildExactDateFromUTC(schedule.start)
      ).startOf("day");
    }

    if (schedule.end) {
      periodEndDay = moment(
        buildExactDateFromUTC(schedule.end)
      ).startOf("day");
    }

    let periodicity = null;

    if (data.eventType) {
      periodicity = data.eventType;
    }
    if (
      periodicity === PeriodType.Weekly &&
      schedule.dayOfWeek &&
      schedule.dayOfWeek.length === 5
    ) {
      periodicity = PeriodType.Weekday;
    }

    const activityOrFlowName = getActivityName(
      applet,
      activityId,
      activityFlowId
    );

    const activityOrFlowDescription = getActivityDescription(
      applet,
      activityId,
      activityFlowId
    );

    eventResult.eventName = generateEventName(
      activityOrFlowName,
      periodicity,
      data.notifications,
      data.reminder
    );

    const aboutWeekAgoDay = moment(today).add(-8, "days");

    if (!periodicity && scheduledTimeDate < aboutWeekAgoDay) {
      return;
    }
    if (periodicity && periodEndDay && periodEndDay < today) {
      return;
    }
    if (periodicity && periodStartDay && periodStartDay > lastScheduleDay) {
      return;
    }
    if (!data.notifications || !data.notifications.length) {
      return;
    }

    if (!periodicity) {
      for (let notificationData of data.notifications) {
        if (!notificationData.start || !data.useNotifications) {
          continue;
        }
        const notification = createNotification({
          scheduledDay: moment(scheduledTimeDate),
          startTimeString: notificationData.start,
          randomEndTimeString: notificationData.random
            ? notificationData.end
            : null,
          activityOrFlowName,
          description: activityOrFlowDescription,
          isReminder: false,
          activityId,
          activityFlowId,
          eventId,
          appletId,
        });
        markNotificationIfActivityCompleted(
          activityId,
          activityFlowId,
          eventId,
          finishedTimes,
          notification
        );
        markIfNotificationOutdated(notification);
        eventResult.notifications.push(notification);
      }

      const reminder = createReminder({
        dateTime: moment(scheduledTimeDate),
        activityId,
        activityFlowId,
        activityOrFlowName,
        eventId,
        appletId,
        reminderData: data.reminder,
        finishedTimes,
      });

      if (reminder && reminder.isActive) {
        markIfNotificationOutdated(reminder);
      }
      if (reminder) {
        eventResult.notifications.push(reminder);
      }

      if (isActivityOrFlowHidden) {
        markAllAsInactiveDueToActivityHidden(eventResult.notifications);      
      }

      return;
    }

    const daysForNotifications = getEventDays({
      firstScheduleDay,
      lastScheduleDay,
      periodStartDay,
      periodEndDay,
      periodicity,
      aboutWeekAgoDay,
      scheduledTimeDate,
      weekDays,
    });

    for (let day of daysForNotifications) {
      for (let notificationData of data.notifications) {
        if (!notificationData.start || !data.useNotifications) {
          continue;
        }
        const notification = createNotification({
          scheduledDay: moment(day),
          startTimeString: notificationData.start,
          randomEndTimeString: notificationData.random
            ? notificationData.end
            : null,
          activityOrFlowName,
          description: activityOrFlowDescription,
          isReminder: false,
          activityId,
          activityFlowId,
          eventId,
          appletId,
        });
        markNotificationIfActivityCompleted(
          activityId,
          activityFlowId,
          eventId,
          finishedTimes,
          notification
        );
        markIfNotificationOutdated(notification);
        eventResult.notifications.push(notification);
      }

      const reminder = createReminder({
        dateTime: moment(day),
        activityId,
        activityFlowId,
        activityOrFlowName,
        eventId,
        appletId,
        reminderData: data.reminder,
        finishedTimes,
      });

      if (reminder && reminder.isActive) {
        markIfNotificationOutdated(reminder);
      }
      if (reminder) {
        eventResult.notifications.push(reminder);
      }
    }

    if (isActivityOrFlowHidden) {
      markAllAsInactiveDueToActivityHidden(eventResult.notifications);      
    }
  };

  for (let eventId in applet.schedule.actual_events) {
    try {
      processEvent(eventId);
    } catch (err) {
      console.warn("[NotificationsBuilder.processEvent] error occured: ", err);
    }
  }
  return result;
};

const getEventDays = ({
  firstScheduleDay,
  lastScheduleDay,
  periodStartDay,
  periodEndDay,
  periodicity,
  aboutWeekAgoDay,
  scheduledTimeDate,
  weekDays,
}) => {
  const eventDays = [];

  const getDayFrom = (anchorDay) => {
    let dayFrom;
    if (!periodStartDay) {
      dayFrom = anchorDay;
    } else {
      dayFrom = periodStartDay > anchorDay ? periodStartDay : anchorDay;
    }
    return dayFrom;
  };

  let dayTo;
  if (!periodEndDay) {
    dayTo = lastScheduleDay;
  } else {
    dayTo = periodEndDay < lastScheduleDay ? periodEndDay : lastScheduleDay;
  }

  if (periodicity === PeriodType.Daily) {
    const dayFrom = getDayFrom(firstScheduleDay);
    let day = moment(dayFrom);

    while (day <= dayTo) {
      eventDays.push(moment(day));
      day = day.add(1, "day");
    }
  }

  if (periodicity === PeriodType.Weekly) {
    let day = moment(scheduledTimeDate);

    while (day <= dayTo) {
      if (day >= aboutWeekAgoDay) {
        eventDays.push(moment(day));
      }
      day = day.add(7, "days");
    }
  }

  if (periodicity === PeriodType.Weekday) {
    const dayFrom = getDayFrom(firstScheduleDay);
    let day = moment(dayFrom);

    while (day <= dayTo) {
      const found = weekDays.find((x) => x.isSame(day));
      if (found) {
        eventDays.push(moment(day));
      }
      day = day.add(1, "day");
    }
  }

  if (periodicity === PeriodType.Monthly) {
    const monthAgoDay = moment()
      .startOf("day")
      .add(-1, "month");

    let day = moment(scheduledTimeDate);

    while (day <= dayTo) {
      if (day >= monthAgoDay) {
        eventDays.push(moment(day));
      }
      day = day.add(1, "month");
    }
  }
  return eventDays;
};

const getWeekDays = (numberOfDaysForSchedule) => {
  let today = moment().startOf("day");
  const result = [];

  for (let i = 0; i < numberOfDaysForSchedule; i++) {
    const current = moment(today).add(i, "day");
    const weekDay = current.isoWeekday();
    if (weekDay >= 1 && weekDay <= 5) {
      result.push(current);
    }
  }
  return result;
};

const getIdBySplit = (sid) => {
  return sid.split("/").pop();
};

const getActivityName = (applet, activityId, activityFlowId) => {
  if (activityId) {
    return applet.activities.find(
      (x) => x.id === getActivityPrefixedId(activityId)
    )?.name.en;
  } else {
    return applet.activityFlows.find(
      (x) => x.id === getActivityFlowPrefixedId(activityFlowId)
    )?.name;
  }
};

const getActivityDescription = (applet, activityId, activityFlowId) => {
  if (activityId) {
    return applet.activities.find(
      (x) => x.id === getActivityPrefixedId(activityId)
    ).description.en;
  } else {
    return applet.activityFlows.find(
      (x) => x.id === getActivityFlowPrefixedId(activityFlowId)
    ).description;
  }
};

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
};

const createNotification = ({
  scheduledDay,
  startTimeString,
  randomEndTimeString,
  activityOrFlowName,
  description,
  isReminder,
  activityId,
  activityFlowId,
  eventId,
  appletId,
}) => {
  const startsAt = moment(scheduledDay);

  const startTimeValues = startTimeString.split(":").map((x) => Number(x));

  startsAt.hour(startTimeValues[0]);
  startsAt.minute(startTimeValues[1]);

  let resultScheduledAt;

  if (randomEndTimeString) {
    const endTimeValues = randomEndTimeString.split(":").map((x) => Number(x));
    const endsAt = moment(scheduledDay);

    endsAt.hour(endTimeValues[0]);
    endsAt.minute(endTimeValues[1]);

    let diff = endsAt.diff(startsAt);

    if (diff < 0) {
      diff = -diff;
    }

    const randomDiff = getRandomInt(diff);

    resultScheduledAt =
      startsAt > endsAt
        ? endsAt.add(randomDiff, "ms")
        : startsAt.add(randomDiff, "ms");
  } else {
    resultScheduledAt = startsAt;
  }

  const id = uuidv4();
  const shortId = `${id.slice(0, 2)}_${id.slice(-3)}`;

  const notification = {
    notificationId: id,
    shortId,
    appletId,
    activityId,
    activityFlowId,
    eventId,
    type: isReminder ? NotificationType.Reminder : NotificationType.Base,
    notificationHeader: activityOrFlowName,
    notificationBody: description,
    activityOrFlowName,
    scheduledAt: resultScheduledAt.valueOf(),
    scheduledAtString: resultScheduledAt.toString(),
    isActive: true,
  };

  return notification;
};

const markNotificationIfActivityCompleted = (
  activityId,
  activityFlowId,
  eventId,
  finishedTimes,
  notification
) => {
  const responseDateTime = getActivityResponseDateTime({
    activityId,
    activityFlowId,
    eventId,
    finishedTimes
  });
  if (!responseDateTime) {
    return;
  }

  const responseDay = moment(responseDateTime).startOf("day");
  const scheduledAt = moment(notification.scheduledAt);
  const notificationDay = moment(scheduledAt).startOf("day");

  if (responseDay.isSame(notificationDay) && scheduledAt > responseDateTime) {
    notification.isActive = false;
    notification.inactiveReason = InactiveReason.ActivityCompleted;
  }
};

const createReminder = ({
  dateTime,
  activityId,
  activityFlowId,
  activityOrFlowName,
  eventId,
  appletId,
  reminderData,
  finishedTimes,
}) => {
  // todo - should be applied in the origin place later
  const day = moment(dateTime).startOf('day'); 

  if (!isReminderSet(reminderData)) {
    return null;
  }
  const { days: sdays, time: stime } = reminderData;
  const days = Number(sdays);
  const timeValues = stime ?? "00:00";

  const fireDay = moment(day).add(days, "days");
  const description = `Just a kindly reminder to complete the activity for ${day
    .toDate()
    .toDateString()}`;

  const notification = createNotification({
    scheduledDay: fireDay,
    startTimeString: timeValues,
    randomEndTimeString: null,
    activityOrFlowName,
    description,
    isReminder: true,
    activityId,
    activityFlowId,
    eventId,
    appletId,
  });

  const responseDateTime = getActivityResponseDateTime({
    activityId,
    activityFlowId,
    eventId,
    finishedTimes
  });

  if (responseDateTime) {
    const responseDay = moment(responseDateTime).startOf("day");

    if (day <= responseDay && responseDay <= fireDay) {
      notification.isActive = false;
      notification.inactiveReason =
        InactiveReason.ActivityCompletedInReminderInterval;
      return notification;
    }
  }

  return notification;
};

const isReminderSet = (reminderData) => {
  const unset =
    !reminderData ||
    reminderData.days === null ||
    reminderData.days === undefined ||
    !reminderData.time ||
    !reminderData.valid;
  return !unset;
};

const markIfNotificationOutdated = (notification) => {
  if (moment(notification.scheduledAt) < moment()) {
    notification.isActive = false;
    notification.inactiveReason = InactiveReason.Outdated;
  }
};

const markAllAsInactiveDueToActivityHidden = (notifications) => {
  for (let notification of notifications) {
    notification.isActive = false;
    notification.inactiveReason = InactiveReason.ActivityOrFlowHidden;
  }
}

const generateEventName = (
  activityOrFlowName,
  periodicity,
  notifications,
  reminder
) => {
  const result = `For ${activityOrFlowName}, ${periodicity ??
    "Period unset"}, ${
    notifications ? notifications.length + 1 : 0
  } notifications, reminder ${isReminderSet(reminder) ? "set" : "unset"}`;
  return result;
};

export const getNotificationArray = (notificationsObject) => {
  let result = [];

  for (let applet of notificationsObject.applets) {
    for (let event of applet.events) {
      for (let notification of event.notifications) {
        if (notification.isActive) {
          result.push(notification);
        }
      }
    }
  }
  result = result.sort((a, b) => a.scheduledAt - b.scheduledAt);
  return result;
};

export default { build };
