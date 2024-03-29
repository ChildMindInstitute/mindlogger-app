import React, { Component, Fragment } from "react";
import { Alert, Platform, AppState, Linking } from "react-native";
import PropTypes from "prop-types";
import * as firebase from "react-native-firebase";
import { connect } from "react-redux";
import _ from "lodash";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import { Actions } from "react-native-router-flux";
import moment from "moment";
import i18n from "i18next";
import EncryptedStorage from 'react-native-encrypted-storage'

import config from '../config'
import { setFcmToken } from "../state/fcm/fcm.actions";
import { appletsSelector } from "../state/applets/applets.selectors";
import {
  setCurrentApplet,
  setCurrentActivity,
  setAppStatus,
  setLastActiveTime,
} from "../state/app/app.actions";
import {
  startResponse,
  refreshTokenBehaviors,
} from "../state/responses/responses.thunks";
import { inProgressSelector } from "../state/responses/responses.selectors";
import {
  lastActiveTimeSelector,
  finishedEventsSelector,
  finishedTimesSelector,
} from "../state/app/app.selectors";
import {
  updateBadgeNumber,
  downloadApplets,
  setLocalNotifications,
} from "../state/applets/applets.thunks";
import {
  syncTargetApplet,
  sync,
  showToast,
  syncUploadQueue,
} from "../state/app/app.thunks";
import NetInfo from "@react-native-community/netinfo";

import { BackgroundWorker, UserInfoStorage } from '../features/system'
import {
  NotificationManager,
  NotificationRenderer,
  isActivityCompletedToday,
  canShowNotificationOnCurrentScreen,
  fakeFirebase,
} from '../features/notifications'

import { withDelayer } from '../utils'
import { debugScheduledNotifications } from '../utils/debug-utils'
import { canSupportNotifications } from '../utils/constants'

import { sendResponseReuploadRequest } from "../services/network";
import { delayedExec, clearExec } from "../services/timing";
import { authTokenSelector } from "../state/user/user.selectors";
import sortActivities from "./ActivityList/sortActivities";
import { NotificationManagerMutex } from "../features/notifications/services/NotificationManager";

const isAndroid = Platform.OS === "android";
const isIOS = Platform.OS === "ios";

const AndroidChannelId = "MindLoggerChannelId";
const fMessaging = canSupportNotifications ? firebase.messaging() : fakeFirebase.messaging();
const fNotifications = canSupportNotifications ? firebase.notifications() : fakeFirebase.notifications();

const userInfoStorage = UserInfoStorage(EncryptedStorage);

const setDefaultApiHost = async () => {
  const apiHost = await userInfoStorage.getApiHost();

  if (apiHost) return;

  userInfoStorage.setApiHost(config.defaultApiHost);
}

class AppService extends Component {
  async componentDidMount() {
    this.listeners = [
      fNotifications.onNotification(this.onNotification),
      fNotifications.onNotificationDisplayed(this.onNotificationDisplayed),
      fNotifications.onNotificationOpened(this.onNotificationOpened),
      fMessaging.onTokenRefresh(this.onTokenRefresh),
      fMessaging.onMessage(this.onMessage),
      NetInfo.addEventListener(this.handleNetworkChange)
    ];
    this.appState = "active";
    this.pendingNotification = null;
    this.notificationsCount = 0;
    this.refreshIntervalId = 0;
    this.tokenIntervalId = 0;
    this.notificationDelayTimeoutIds = [];

    if (isAndroid) {
      this.initAndroidChannel();
    }
    if (isIOS) {
      this.notificationsCount = await this.getDeliveredNotificationsCount();
      firebase.messaging().ios.registerForRemoteNotifications();
    }

    AppState.addEventListener("change", this.handleAppStateChange);

    this.requestPermissions();

    this.props.setFCMToken(await fMessaging.getToken());

    const event = await fNotifications.getInitialNotification();
    let promise = Promise.resolve();
    if (event) {
      promise = this.openActivityByEventId(event);
    }

    promise.then(() => {
      this.startTimer();
      this.props.setAppStatus(true);
      this.props.syncUploadQueue();
    });

    if (!canSupportNotifications) {
      firebase.messaging().deleteToken();
    }

    BackgroundWorker.setTask(async () => {
      const isForeground = AppState.currentState === "active";

      if (isForeground) return;
      if (!canSupportNotifications) return;

      if (NotificationManagerMutex.isBusy()) {
        console.warn(
          "[AppService.componentDidMount:BackgroundWorker.setTask]: NotificationManagerMutex is busy. Operation rejected"
        );
        return;
      }

      try {
        NotificationManagerMutex.setBusy();

        await NotificationManager.topUpNotificationsFromQueue();

        await debugScheduledNotifications({
          actionType: "backgroundAddition-AppService-componentDidMount",
        });
      } finally {
        NotificationManagerMutex.release();
      }
    });
  }

  /**
   * start timer for app ( automatically refreshes app at 12:00am everyday)
   */
  startTimer() {
    const { sync, refreshTokenBehaviors } = this.props;
    const day = 24 * 3600 * 1000;

    const currentTime = new Date();
    const nextDay = new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      currentTime.getDate() + 1
    );
    const refreshTimeLeft = nextDay.getTime() - currentTime.getTime() + 1000;

    this.refreshIntervalId = delayedExec(
      () => {
        sync();
        this.refreshIntervalId = delayedExec(sync, { every: day });
      },
      { after: refreshTimeLeft }
    );

    nextDay.setHours(3);
    const tokenTimeLeft = nextDay.getTime() - currentTime.getTime();

    refreshTokenBehaviors();

    this.tokenIntervalId = delayedExec(
      () => {
        refreshTokenBehaviors();
        this.tokenIntervalId = delayedExec(sync, { every: day });
      },
      { after: tokenTimeLeft }
    );
  }

  clearTimer() {
    if (this.refreshIntervalId) {
      clearExec(this.refreshIntervalId);
      this.refreshIntervalId = 0;
    }
  }

  /**
   * Removes all event listeners set on component creation.
   *
   * @returns {void}
   */
  componentWillUnmount() {
    if (this.listeners) {
      this.listeners.forEach((removeListener) => removeListener());
    }
    AppState.removeEventListener("change", this.handleAppStateChange);

    this.clearTimer();
  }

  /**
   * Checks whether the app has permission to show notifications.
   *
   * It asks the user to grant permission if not it wasn't granted already.
   *
   * @returns {void}
   */
  async requestPermissions() {
    const permissionGranted = await fMessaging.hasPermission();

    if (permissionGranted) return;

    try {
      await fMessaging.requestPermission();
    } catch (error) {}

    if (!(await fMessaging.hasPermission())) {
      Alert.alert(
        i18n.t("firebase_messaging:alert_title"),
        i18n.t("firebase_messaging:alert_message"),
        [
          {
            text: "Dismiss",
            style: "cancel",
          },
          {
            text: i18n.t("firebase_messaging:alert_text"),
            onPress: Linking.openSettings.bind(Linking),
            style: "default",
          },
        ]
      );
    }
  }

  /**
   * Finds an activity.
   * Also it checks if applet contains needed event
   *
   * @param {string} eventId the unique ID for the scheduled event.
   * @param {object} applet the applet instance.
   * @param {string} activityId the ID for the requested activity.
   *
   * @returns {object} the requested activity.
   */
  findActivityById(eventId, applet, activityId, activityFlowId) {
    let activity = null;

    if (activityId) {
      activity = applet.activities.find(({ id }) => id.endsWith(activityId));
    } else {
      activity = applet.activityFlows.find(({ id }) =>
        id.endsWith(activityFlowId)
      );
    }

    if (!activity) {
      return null;
    }

    let event = this.getEventFromAppletSchedule(eventId, applet);

    if (!event) {
      return null;
    }

    const sortedActivities = sortActivities(
      activityId ? applet.activities : applet.activityFlows,
      this.props.inProgress,
      this.props.finishedEvents,
      applet.schedule.data
    );

    const id = activityId || activityFlowId;

    let sortedActivity = sortedActivities.find(
      (activity) => activity.id && activity.id.endsWith(id)
    );
    if (sortedActivity) {
      return sortedActivity;
    }

    activity.isCompleted = true;
    return activity;
  }

  /**
   * Opens the activity corresponding to the given notification.
   *
   * If the activity is not found in the applet, synchronize the applet with
   * the backend first and then open the activity.
   *
   * @param {object} notificationObj the notification data.
   *
   * @returns {void}
   */
  openActivityByEventId = async (notificationObj) => {
    const type = notificationObj.notification.data.type;

    if (type === "response-data-alert") {
      Alert.alert(
        i18n.t("firebase_messaging:response_refresh_request"),
        i18n.t("firebase_messaging:refresh_request_details"),
        [
          {
            text: "Request Refresh",
            onPress: () => {
              sendResponseReuploadRequest({
                authToken: this.props.authToken,
                userPublicKeys: this.props.applets.reduce(
                  (previousValue, applet) => {
                    if (applet.userPublicKey) {
                      previousValue[applet.id.split("/")[1]] =
                        applet.userPublicKey;
                    }
                    return previousValue;
                  },
                  {}
                ),
              }).then(() => {
                this.props.showToast({
                  text: i18n.t("firebase_messaging:refresh_request_text"),
                  position: "bottom",
                  type: "success",
                  duration: 1000,
                });
              });
            },
          },
          {
            text: "No",
            onPress: () => {},
          },
        ],
        { cancelable: false }
      );
    }

    if (
      type === "applet-update-alert" ||
      type === "applet-delete-alert" ||
      type === "schedule-updated"
    ) {
      const networkState = await NetInfo.fetch();
      if (networkState.isConnected) {
        this.props.downloadApplets(null, null, type);
      }

      if (Actions.currentScene !== "applet_list") {
        Actions.push("applet_list");
      }
    }

    if (type === "request-to-reschedule-dueto-limit") {
      this.props.setLocalNotifications(`notification-tap:${type}`);
    }

    if (type === "schedule-event-alert") {
      const {
        eventId,
        appletId,
        activityId,
        activityFlowId,
      } = notificationObj.notification.data;

      if (!eventId || !appletId) return;
      if (!activityId && !activityFlowId) return;

      const applet = this.props.applets.find(({ id }) => id.endsWith(appletId));

      if (!applet) {
        return Alert.alert(
          i18n.t("firebase_messaging:applet_not_found_1"),
          i18n.t("firebase_messaging:applet_not_found_2")
        );
      }

      const activity = this.findActivityById(
        eventId,
        applet,
        activityId,
        activityFlowId
      );

      if (activity) {
        const event = this.getEventFromAppletSchedule(eventId, applet);
        return this.prepareAndOpenActivity(applet, activity, event);
      }

      if (Actions.currentScene !== "applet_list") {
        Actions.push("applet_list");
      }
    }
  };

  getEventFromAppletSchedule = (eventId, applet) => {
    let result = null;

    for (let key in applet.schedule.events) {
      const event = applet.schedule.events[key];
      if (event.id.endsWith(eventId)) {
        result = event;
      }
    }
    if (result) {
      return result;
    }
    for (let key in applet.schedule.actual_events) {
      const event = applet.schedule.actual_events[key];
      if (event.id.endsWith(eventId)) {
        result = event;
      }
    }
    return result;
  };

  prepareAndOpenActivity = (applet, activity, event) => {
    if (!event) {
      throw new Error(
        "[prepareAndOpenActivity] event parameter is not defined"
      );
    }
    const today = new Date();
    const todayEnd = moment()
      .endOf("day")
      .utc();
    const { scheduledTime, data } = event;
    const activityTimeout =
      data.timeout.day * 864000000 +
      data.timeout.hour * 3600000 +
      data.timeout.minute * 60000;

    if (!activity) {
      return Alert.alert(i18n.t("firebase_messaging:activity_not_found"));
    }

    this.props.setCurrentApplet(applet.id);

    if (activity.isCompleted) {
      Actions.push("applet_details", { initialTab: "data" });
      return Alert.alert(
        "",
        `${i18n.t("firebase_messaging:already_completed")} ‘${
          activity.name.en
        }’`
      );
    }

    if (Actions.currentScene === "applet_details") {
      Actions.replace("applet_details");
    } else {
      Actions.push("applet_details");
    }

    if (
      scheduledTime > todayEnd._d ||
      (data.timeout.allow &&
        today.getTime() - scheduledTime.getTime() > activityTimeout)
    ) {
      return Alert.alert(
        "",
        `${`${i18n.t(
          "firebase_messaging:activity_was_due_at"
        )} ${scheduledTime}. ${i18n.t(
          "firebase_messaging:if_progress_was_made_on_the"
        )} ` +
          `${activity.name.en}, ${i18n.t(
            "firebase_messaging:it_was_saved_but_it_can_no_longer_be_taken"
          )} `}${i18n.t("firebase_messaging:today")}`
      );
    }

    if (activity.status !== "scheduled" || event.data.timeout.access) {
      if (Actions.currentScene == "take_act") {
        Actions.pop();
      }

      this.props.setCurrentActivity(activity.id);
      this.props.startResponse({
        ...activity,
        event,
      });
    } else {
      const time = moment(activity.event.scheduledTime).format("HH:mm");

      Alert.alert(
        i18n.t("firebase_messaging:today"),
        `${i18n.t("firebase_messaging:not_able_to_start")}, ‘${
          activity.name.en
        }’ ${i18n.t("firebase_messaging:is")} ` +
          `${i18n.t(
            "firebase_messaging:scheduled_to_start_at"
          )} ${time} ${i18n.t("firebase_messaging:today")}`
      );
    }
  };

  /**
   * Creates the notification channel for android.
   *
   * @return {void}
   */
  async initAndroidChannel() {
    if (!canSupportNotifications) return;

    const channel = new firebase.notifications.Android.Channel(
      AndroidChannelId,
      "MindLogger Channel",
      firebase.notifications.Android.Importance.Max
    ).setDescription("MindLogger Channel");

    await firebase.notifications().android.createChannel(channel);
  }

  /**
   * Method called when a notification has been displayed.
   *
   * @param {object} notification the notification data.
   * Data type of notification: firebase.RNFirebase.notifications.Notification
   *
   * @returns {void}
   */
  onNotificationDisplayed = async (notification) => {
    if (isIOS) {
      this.notificationsCount = await this.getDeliveredNotificationsCount();

      this.updateApplicationIconBadgeNumber();
    }
  };

  /**
   * Returns a promise that resolves to the delivered notifications count.
   *
   * @returns {Promise} promise that resolves to the notification count.
   */
  getDeliveredNotificationsCount() {
    return new Promise((resolve) =>
      PushNotificationIOS.getDeliveredNotifications(({ length }) =>
        resolve(length)
      )
    );
  }

  /*
  Data type of message: firebase.RNFirebase.messaging.RemoteMessage
  */
  onMessage = async (message) => {
    const { data } = message;
    const localNotification = this.newNotification({
      notificationId: message.messageId,
      title: data.title || "Push Notification",
      subtitle: data.subtitle || null,
      data,
    });

    await this.handleForegroundNotification(localNotification);
  };

  /**
   * This method is called when a notification is received while the app is in
   * the foreground.
   *
   * @param {object} notification notification data.
   * @param {string} notification.notificationId the ID for the notification.
   * @param {string} notification.title the title for the notification.
   * @param {string} notification.subtitle the subtitle for the notification.
   * @param {string} notification.body the main text for the notification.
   * @param {object} notification.data extra data for the notification.
   *
   * @returns {void}
   */
  onNotification = async (notification) => {
    const localNotification = this.newNotification({
      notificationId: notification.notificationId,
      title: notification.title,
      subtitle: notification.subtitle,
      body: notification.body,
      data: notification.data,
    });

    await this.handleForegroundNotification(localNotification);
  };

  handleForegroundNotification = async (localNotification) => {
    const renderNotification = withDelayer(NotificationRenderer.render, {
      check: ({ DelayCheckResult }) => {
        const activityCompleted = isActivityCompletedToday({
          ...localNotification.data,
          getFinishedTimes: () => this.props.finishedTimes
        });

        if (activityCompleted) return DelayCheckResult.Cancel;

        const canShow = canShowNotificationOnCurrentScreen();

        if (!canShow) return DelayCheckResult.Postpone;

        return DelayCheckResult.ExecuteAndExit;
      },
      repeatIn: 10000,
    })

    return renderNotification(localNotification);
  };

  /**
   * Method called when the notification is pressed.
   *
   * @param {object} notificationOpen the notification data.
   * Data type of notificationOpen:
   * firebase.RNFirebase.notifications.NotificationOpen
   *
   * @returns {void}
   */
  onNotificationOpened = async (notificationOpen) => {
    if (this.appState == "background") {
      this.pendingNotification = notificationOpen;
    } else {
      await this.openActivityByEventId(notificationOpen);
    }

    if (isIOS) {
      this.notificationsCount = await this.getDeliveredNotificationsCount();

      this.updateApplicationIconBadgeNumber();
      this.props.updateBadgeNumber(this.notificationsCount);
    }
  };

  /**
   * Updates the notifications badge number for iOS.
   *
   * @returns {void}
   */
  updateApplicationIconBadgeNumber = () => {
    PushNotificationIOS.setApplicationIconBadgeNumber(this.notificationsCount);
  };

  /**
   * Stores the new FCM token in the app state.
   *
   * @param {string} fcmToken a Firebase Cloud Messaging token.
   *
   * @returns {void}
   */
  onTokenRefresh = (fcmToken) => {
    this.props.setFCMToken(fcmToken);
  };

  /**
   * Creates a new notification with the given data.
   *
   * @param {object} notification the notification data.
   * @param {string} notification.notificationId the notification ID.
   * @param {string} notification.title a title for the notification.
   * @param {string} [notification.subtitle] optional notification subtitle.
   * @param {number} notification.iosBadge the badge count for iOS.
   *
   * @return {Notification} a firebase notification instance.
   */
  newNotification = ({
    notificationId,
    title,
    subtitle,
    body,
    iosBadge = 1,
    data,
  }) => {
    const localNotification = new firebase.notifications.Notification()
      .setNotificationId(notificationId)
      .setTitle(title)
      .setBody(body)
      .setSound("default")
      .setData(data);

    if (subtitle) {
      localNotification.setSubtitle(subtitle);
    }

    if (isAndroid) {
      localNotification.android.setChannelId(AndroidChannelId);
      localNotification.android.setPriority(
        firebase.notifications.Android.Priority.High
      );
      localNotification.android.setAutoCancel(true);
    } else if (isIOS) {
      localNotification.ios.setBadge(iosBadge);
    }

    return localNotification;
  };

  handleNetworkChange = ({ isConnected }) => {
    if (isConnected) {
      this.props.syncUploadQueue();
    }
  }

  /**
   * Checks whether the application is in the background.
   *
   * @param {string} state the state of the app.
   *
   * @returns {boolean} whether the application is in the background.
   */
  isBackgroundState = (state) => state?.match(/inactive|background/);

  /**
   * Handles the switching of the app from foreground to background or the other
   * way around.
   *
   * @param {string} nextAppState the state the app is switching to.
   * DataType of nextAppState: AppStateStatus
   *
   * @returns {void}
   */
  handleAppStateChange = async (nextAppState) => {
    const {
      setAppStatus,
      updateBadgeNumber,
      setLastActiveTime,
      syncUploadQueue,
      setLocalNotifications,
    } = this.props;

    const goingToBackground =
      this.isBackgroundState(nextAppState) && this.appState === "active";
    const goingToForeground =
      this.isBackgroundState(this.appState) && nextAppState === "active";
    const stateChanged = nextAppState !== this.appState;

    if (goingToBackground) {
      setAppStatus(false);
      setLastActiveTime(new Date().getTime());
      this.clearTimer();
    } else if (goingToForeground) {
      setAppStatus(true);
      syncUploadQueue();
      this.startTimer();
    }

    if (stateChanged && isIOS) {
      this.notificationsCount = await this.getDeliveredNotificationsCount();
      updateBadgeNumber(this.notificationsCount);
    }

    if (goingToForeground) {
      await setLocalNotifications("goingToForeground");
    }

    if (goingToForeground && this.pendingNotification) {
      await this.openActivityByEventId(this.pendingNotification);
      this.pendingNotification = null;
    }

    this.appState = nextAppState;
  };

  /**
   * Generates and returns the DOM for this compoent.
   *
   * @returns {JSX} the markup for the component.
   */
  render() {
    const { children } = this.props;

    return <Fragment>{children}</Fragment>;
  }
}

AppService.propTypes = {
  children: PropTypes.node.isRequired,
  setFCMToken: PropTypes.func.isRequired,
  applets: PropTypes.array.isRequired,
  setAppStatus: PropTypes.func.isRequired,
  inProgress: PropTypes.object,
  setCurrentApplet: PropTypes.func.isRequired,
  startResponse: PropTypes.func.isRequired,
  updateBadgeNumber: PropTypes.func.isRequired,
  downloadApplets: PropTypes.func.isRequired,
  syncTargetApplet: PropTypes.func.isRequired,
};

AppService.defaultProps = {
  inProgress: {},
};

const mapStateToProps = (state) => ({
  applets: appletsSelector(state),
  inProgress: inProgressSelector(state),
  authToken: authTokenSelector(state),
  lastActive: lastActiveTimeSelector(state),
  finishedEvents: finishedEventsSelector(state),
  finishedTimes: finishedTimesSelector(state),
});

const mapDispatchToProps = (dispatch) => {
  const debouncedSyncUploadQueue = _.debounce(() => {
    dispatch(syncUploadQueue())
  }, 500);

  return {
    setFCMToken: async (token) => {
      dispatch(setFcmToken(token));
  
      if (canSupportNotifications) {
        await userInfoStorage.setFCMToken(token);
      }
      setDefaultApiHost();
    },
    setAppStatus: (appStatus) => dispatch(setAppStatus(appStatus)),
    setCurrentApplet: (id) => dispatch(setCurrentApplet(id)),
    startResponse: (activity) => dispatch(startResponse(activity)),
    updateBadgeNumber: (badgeNumber) => dispatch(updateBadgeNumber(badgeNumber)),
    downloadApplets: (cb, keys, trigger) => dispatch(downloadApplets(cb, keys, trigger)),
    sync: (cb) => dispatch(sync(cb)),
    syncTargetApplet: (appletId, cb) => dispatch(syncTargetApplet(appletId, cb)),
    showToast: (toast) => dispatch(showToast(toast)),
    setLastActiveTime: (time) => dispatch(setLastActiveTime(time)),
    refreshTokenBehaviors: () => dispatch(refreshTokenBehaviors()),
    setCurrentActivity: (activityId) => dispatch(setCurrentActivity(activityId)),
    syncUploadQueue: () => {
      debouncedSyncUploadQueue.cancel();
      debouncedSyncUploadQueue();
    },
    setLocalNotifications: (trigger) => dispatch(setLocalNotifications(trigger)),
  }
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AppService);
