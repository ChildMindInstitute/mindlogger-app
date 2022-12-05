import moment from "moment";

import { getActivityResponseDateTime } from '../utils'

function CanShowActivityNotificationStrategy({ getFinishedTimes }) {
  function activityCompletedToday({ activityId, activityFlowId, eventId }) {
    const responseDateTime = getActivityResponseDateTime({
      activityId,
      activityFlowId,
      eventId,
      finishedTimes: getFinishedTimes(),
    });

    if (!responseDateTime) return true;

    const responseStartOfDay = responseDateTime.startOf('day');
    const startOfCurrentDay = moment().startOf('day');

    return responseStartOfDay.isBefore(startOfCurrentDay);
  }

  return function execute(notificationData) {
    return activityCompletedToday(notificationData);
  }
}

export default CanShowActivityNotificationStrategy;
