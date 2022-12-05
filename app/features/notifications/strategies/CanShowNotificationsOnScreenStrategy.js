import moment from "moment";
import { Actions } from "react-native-router-flux";

import { SCENES_TO_NOT_RENDER_NOTIFICATIONS } from '../constants';

function CanShowNotificationsOnScreenStrategy() {
  return function execute() {
    return !SCENES_TO_NOT_RENDER_NOTIFICATIONS.includes(Actions.currentScene);
  }
}

export default CanShowNotificationsOnScreenStrategy;
