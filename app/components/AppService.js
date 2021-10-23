import React, { Component, Fragment } from 'react';
import { Alert, Platform, AppState, AppStateStatus, Linking, NativeModules, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import * as firebase from 'react-native-firebase';
import { connect } from 'react-redux';
import _ from 'lodash';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import RNRestart from 'react-native-restart';
import { Actions } from 'react-native-router-flux';
import moment from 'moment';
import i18n from 'i18next';
import { setFcmToken } from '../state/fcm/fcm.actions';
import { appletsSelector } from '../state/applets/applets.selectors';
import { setCurrentApplet, setCurrentActivity, setAppStatus, setLastActiveTime } from '../state/app/app.actions';
import { startResponse } from '../state/responses/responses.thunks';
import { inProgressSelector } from '../state/responses/responses.selectors';
import { lastActiveTimeSelector, finishedEventsSelector } from '../state/app/app.selectors';
import { updateBadgeNumber, downloadApplets } from '../state/applets/applets.thunks';
import { syncTargetApplet, sync, showToast } from '../state/app/app.thunks';

import { sendResponseReuploadRequest } from '../services/network';
import { delayedExec, clearExec } from '../services/timing';
import { authTokenSelector } from '../state/user/user.selectors';
import sortActivities from './ActivityList/sortActivities';

const AndroidChannelId = 'MindLoggerChannelId';
const fMessaging = firebase.messaging.nativeModuleExists && firebase.messaging();
const fNotifications = firebase.notifications.nativeModuleExists && firebase.notifications();

const isAndroid = Platform.OS === 'android';
const isIOS = Platform.OS === 'ios';

class AppService extends Component {
  /**
   * Method called when the component is about to be rendered.
   *
   * Sets up the notification channels and the handler functions for the
   * notification events.
   *
   * @returns {void}
   */
  async componentDidMount() {
    this.listeners = [
      fNotifications.onNotification(this.onNotification),
      fNotifications.onNotificationDisplayed(this.onNotificationDisplayed),
      fNotifications.onNotificationOpened(this.onNotificationOpened),
      fMessaging.onTokenRefresh(this.onTokenRefresh),
      fMessaging.onMessage(this.onMessage),
    ];
    this.appState = 'active';
    this.pendingNotification = null;
    this.notificationsCount = 0;
    this.intervalId = 0;
    // AppState.addEventListener('change', this.handleAppStateChange);

    if (isAndroid) {
      this.initAndroidChannel();
    }
    if (isIOS) {
      this.notificationsCount = await this.getDeliveredNotificationsCount();
      firebase.messaging().ios.registerForRemoteNotifications();
    }
    // this.notificationsCount = await this.getDeliveredNotificationsCount();
    AppState.addEventListener('change', this.handleAppStateChange);


    this.requestPermissions();
    this.props.setFCMToken(await fMessaging.getToken());

    const event = await fNotifications.getInitialNotification();
    if (event) {
      this.openActivityByEventId(event);
      // if (isAndroid) NativeModules.DevSettings.reload();
    }

    this.startTimer();
  }

  /**
   * start timer for app ( automatically refreshes app at 12:00am everyday)
   */
  startTimer()
  {
    const { sync } = this.props;
    const updateScheduleDelay = 24 * 3600 * 1000;

    const currentTime = new Date();
    const nextDay = new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      currentTime.getDate() + 1,
    );
    const leftTimeout = nextDay.getTime() - currentTime.getTime() + 1000;

    this.intervalId = delayedExec(
      () => {
        sync();
        this.intervalId = delayedExec(sync, { every: updateScheduleDelay });
      },
      { after: leftTimeout },
    );
  }

  /**
   * Removes all event listeners set on component creation.
   *
   * @returns {void}
   */
  componentWillUnmount() {
    if (this.listeners) {
      this.listeners.forEach(removeListener => removeListener());
    }
    AppState.removeEventListener('change', this.handleAppStateChange);

    if (this.intervalId) {
      clearExec(this.intervalId);
    }
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
    } catch (error) {
    }

    if (!await fMessaging.hasPermission()) {
      Alert.alert(
        i18n.t('firebase_messaging:alert_title'),
        i18n.t('firebase_messaging:alert_message'),
        [
          {
            text: 'Dismiss',
            style: 'cancel',
          },
          {
            text: i18n.t('firebase_messaging:alert_text'),
            onPress: Linking.openSettings.bind(Linking),
            style: 'default',
          },
        ],
      );
    }
  }

  /**
   * Checks whether an activity should be shown as completed.
   *
   * An activity is considered to be completed if a response for this activity
   * was created today and there isn't any more scheduled events for this
   * activity today.
   *
   * @param {obj} activity the activity in question.
   *
   * @returns {boolean} whether the activity is completed or not.
   */
  isCompleted = activity => activity.lastResponseTimestamp
    && !activity.nextScheduledTimestamp
    && moment().isSame(moment(activity.lastResponseTimestamp), 'day');

  /**
   * Checks whether an activity is in progress or not.
   *
   * @param {object} applet the parent applet for the activity.
   * @param {object} activity the activity to be checked.
   *
   * @returns {boolean} whether the activity is in progress or not.
   */
  isActivityCompleted = (applet, activity) => {
    const inProgress = this.props.inProgress || {};
    const id = applet.id + activity.id;

    if (id in inProgress) {
      return false;
    }

    return this.isCompleted(activity);
  };

  /**
   * Finds an activity.
   *
   * It tries to get the activity by ID. If it fails to do that, it tries to get
   * the event by ID and extract the activity data from it.
   *
   * @param {string} eventId the unique ID for the scheduled event.
   * @param {object} applet the applet instance.
   * @param {string} activityId the ID for the requested activity.
   *
   * @returns {object} the requested activity.
   */
  findActivityById(eventId, applet, activityId) {
    let activity = applet.activities.find(({ id }) => id.endsWith(activityId));

    if (!activity) {
      return null;
    }

    let event = {};

    Object.keys(applet.schedule.events).forEach(key => {
      const e = applet.schedule.events[key];
      if (e.id === eventId) {
        event = e;
      }
    });

    if (!event) {
      return null;
    }

    const sortedActivities = sortActivities(
      applet.activities,
      this.props.inProgress,
      this.props.finishedEvents,
      applet.schedule.data
    );

    let sortedActivity = sortedActivities.find(activity => activity.id && activity.id.endsWith(activityId));
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
  openActivityByEventId = (notificationObj) => {
    const type = _.get(notificationObj, 'notification._data.type');

    if (type === 'response-data-alert') {
      Alert.alert(
        i18n.t('firebase_messaging:response_refresh_request'),
        i18n.t('firebase_messaging:refresh_request_details'),
        [
          {
            text: 'Request Refresh',
            onPress: () => {
              sendResponseReuploadRequest({
                authToken: this.props.authToken,
                userPublicKeys: this.props.applets.reduce((previousValue, applet) => {
                  if (applet.userPublicKey) {
                    previousValue[applet.id.split('/')[1]] = applet.userPublicKey;
                  }
                  return previousValue;
                }, {}),
              }).then(() => {
                this.props.showToast({
                  text: i18n.t('firebase_messaging:refresh_request_text'),
                  position: 'bottom',
                  type: 'success',
                  duration: 1000,
                });
              });
            },
          },
          {
            text: 'No',
            onPress: () => {},
          },
        ],
        { cancelable: false },
      );
    } else if (type === 'applet-update-alert' || type === 'applet-delete-alert') {
      const appletId = _.get(notificationObj, 'notification._data.applet_id');

      this.props.downloadApplets(() => {
        // this.props.setCurrentApplet(appletId);
        // Actions.push('applet_details', { initialTab: 'data' });
      });
    } else {
      const eventId = _.get(notificationObj, 'notification._data.event_id', '');
      const appletId = _.get(notificationObj, 'notification._data.applet_id', '');
      const activityId = _.get(notificationObj, 'notification._data.activity_id', '');
      // Ignore the notification if some data is missing.
      if (!eventId || !appletId || !activityId) return;

      const applet = this.props.applets.find(({ id }) => id.endsWith(appletId));

      if (!applet) {
        return Alert.alert(
          i18n.t('firebase_messaging:applet_not_found_1'),
          i18n.t('firebase_messaging:applet_not_found_2'),
        );
      }

      const activity = this.findActivityById(eventId, applet, activityId);

      let event = {};

      Object.keys(applet.schedule.events).forEach(key => {
        const e = applet.schedule.events[key];
        if (e.id.endsWith(eventId)) {
          event = e;
        }
      });

      if (activity) {
        return this.prepareAndOpenActivity(applet, activity, event);
      }

      if (Actions.currentScene !== 'applet_list') {
        Actions.push('applet_list');
      }

      // If the activity ID is not found in the applet, that means the applet is
      // out of sync.
      this.props.syncTargetApplet(appletId, () => {
        activity = this.findActivityById(eventId, applet, activityId);
        this.prepareAndOpenActivity(applet, activity, event);
      });
    }
  };

  /**
   * Returns the given date as the number of miliseconds elapsed since the UNIX
   * epoch.
   *
   * @param {Date} date the date to be converted to miliseconds.
   *
   * @returns {number} the corresponding number of miliseconds.
   */
  getMilliseconds = date => (date
    ? moment(date)
      .toDate()
      .getTime()
    : 0);

  /**
   *
   *
   * @returns {void}
   */
  prepareAndOpenActivity = (applet, activity, event) => {
    const today = new Date();
    const todayEnd = moment().endOf("day").utc();
    const { scheduledTime, data } = event;
    const activityTimeout = data.timeout.day * 864000000
      + data.timeout.hour * 3600000
      + data.timeout.minute * 60000;

    if (!activity) {
      return Alert.alert(i18n.t('firebase_messaging:activity_not_found'));
    }

    this.props.setCurrentApplet(applet.id);

    if (activity.isCompleted) {
      Actions.push('applet_details', { initialTab: 'data' });
      return Alert.alert(
        '',
        `${i18n.t('firebase_messaging:already_completed')} ‘${activity.name.en}’`,
      );
    }

    if (Actions.currentScene === 'applet_details') {
      Actions.replace('applet_details');
    } else {
      Actions.push('applet_details');
    }

    if (scheduledTime > todayEnd._d
      || (data.timeout.allow && (today.getTime() - scheduledTime.getTime() > activityTimeout))) {
      return Alert.alert(
        '',
        `${`${i18n.t('firebase_messaging:activity_was_due_at')} ${scheduledTime}. ${i18n.t(
          'firebase_messaging:if_progress_was_made_on_the',
        )} `
        + `${activity.name.en}, ${i18n.t(
          'firebase_messaging:it_was_saved_but_it_can_no_longer_be_taken',
        )} `}${i18n.t('firebase_messaging:today')}`,
      );
    }

    if (activity.status !== 'scheduled' || event.data.timeout.access) {
      if (Actions.currentScene == 'take_act') {
        Actions.pop();
      }

      this.props.setCurrentActivity(activity.id);
      this.props.startResponse({
        ...activity,
        event
      });
    } else {
      const time = moment(activity.event.scheduledTime).format('HH:mm');

      Alert.alert(
        i18n.t('firebase_messaging:today'),
        `${i18n.t('firebase_messaging:not_able_to_start')}, ‘${activity.name.en}’ ${i18n.t(
          'firebase_messaging:is',
        )} `
          + `${i18n.t('firebase_messaging:scheduled_to_start_at')} ${time} ${i18n.t(
            'firebase_messaging:today',
          )}`,
      );
    }
  };

  /**
   * Creates the notification channel for android.
   *
   * @return {void}
   */
  async initAndroidChannel() {
    const channel = new firebase.notifications.Android.Channel(
      AndroidChannelId,
      'MindLogger Channel',
      firebase.notifications.Android.Importance.Max,
    ).setDescription('MindLogger Channel');

    // Create the channel
    await firebase.notifications().android.createChannel(channel);
  }

  /**
   * Method called when a notification has been displayed.
   *
   * @param {object} notification the notification data.
   *
   * @returns {void}
   */
  onNotificationDisplayed = async (
    notification: firebase.RNFirebase.notifications.Notification,
  ) => {
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
  getDeliveredNotificationsCount(): Promise<number> {
    return new Promise(resolve => PushNotificationIOS.getDeliveredNotifications(({ length }) => resolve(length)));
  }

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
      // iosBadge: notification.ios.badge,
    });


    try {
      await firebase.notifications().displayNotification(localNotification);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`FCM[${Platform.OS}]: error `, error);
    }
  };

  /**
   * Method called when the notification is pressed.
   *
   * @param {object} notificationOpen the notification data.
   *
   * @returns {void}
   */
  onNotificationOpened = async (
    notificationOpen: firebase.RNFirebase.notifications.NotificationOpen,
  ) => {
    if (this.appState == 'background') {
      this.pendingNotification = notificationOpen;
    } else {
      this.openActivityByEventId(notificationOpen);
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
  onTokenRefresh = (fcmToken: string) => {
    this.props.setFCMToken(fcmToken);
  };

  onMessage = async (message: firebase.RNFirebase.messaging.RemoteMessage) => {
    const { data } = message;
    const localNotification = this.newNotification({
      notificationId: message.messageId,
      title: data.title || 'Push Notification',
      subtitle: data.subtitle || null,
      data,
    });

    try {
      await firebase.notifications().displayNotification(localNotification);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`FCM[${Platform.OS}]: error `, error);
    }
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
  newNotification = ({ notificationId, title, subtitle, body, iosBadge = 1, data }) => {
    const localNotification = new firebase.notifications.Notification()
      .setNotificationId(notificationId)
      .setTitle(title)
      .setBody(body)
      .setSound('default')
      .setData(data);

    if (subtitle) {
      localNotification.setSubtitle(subtitle);
    }

    if (isAndroid) {
      localNotification.android.setChannelId(AndroidChannelId);
      localNotification.android.setPriority(firebase.notifications.Android.Priority.High);
      localNotification.android.setAutoCancel(true);
    } else if (isIOS) {
      localNotification.ios.setBadge(iosBadge);
    }

    return localNotification;
  };

  /**
   * Checks whether the application is in the background.
   *
   * @param {string} state the state of the app.
   *
   * @returns {boolean} whether the application is in the background.
   */
  isBackgroundState = state => state?.match(/inactive|background/);

  /**
   * Handles the switching of the app from foreground to background or the other
   * way around.
   *
   * @param {string} nextAppState the state the app is switching to.
   *
   * @returns {void}
   */
  handleAppStateChange = async (nextAppState: AppStateStatus) => {
    const { setAppStatus, updateBadgeNumber, setLastActiveTime, sync, lastActive } = this.props;
    const goingToBackground = this.isBackgroundState(nextAppState) && this.appState === 'active';
    const goingToForeground = this.isBackgroundState(this.appState) && nextAppState === 'active';
    const stateChanged = nextAppState !== this.appState;

    if (goingToBackground) {
      setAppStatus(false);
      setLastActiveTime(new Date().getTime());

      clearExec(this.intervalId);
      this.intervalId = 0;
    } else if (goingToForeground) {
      setAppStatus(true);
      this.startTimer();
    }

    if (stateChanged && isIOS) {
      this.notificationsCount = await this.getDeliveredNotificationsCount();

      updateBadgeNumber(this.notificationsCount);
    }

    this.appState = nextAppState;

    if (this.appState == 'active') {
      /* deactivate for now
        if (!moment().isSame(moment(new Date(lastActive)), 'day')) {
          sync(() => {
            if (this.pendingNotification) {
              this.openActivityByEventId(this.pendingNotification);
              this.pendingNotification = null;
            }
          })
        } else {
          if (this.pendingNotification) {
            this.openActivityByEventId(this.pendingNotification);
            this.pendingNotification = null;
          }
        }
      */
      if (this.pendingNotification) {
        this.openActivityByEventId(this.pendingNotification);
        this.pendingNotification = null;
      }
    }
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

const mapStateToProps = state => ({
  applets: appletsSelector(state),
  inProgress: inProgressSelector(state),
  authToken: authTokenSelector(state),
  lastActive: lastActiveTimeSelector(state),
  finishedEvents: finishedEventsSelector(state),
});

const mapDispatchToProps = dispatch => ({
  setFCMToken: (token) => {
    dispatch(setFcmToken(token));
  },
  setAppStatus: appStatus => dispatch(setAppStatus(appStatus)),
  setCurrentApplet: id => dispatch(setCurrentApplet(id)),
  startResponse: activity => dispatch(startResponse(activity)),
  updateBadgeNumber: badgeNumber => dispatch(updateBadgeNumber(badgeNumber)),
  downloadApplets: (cb) => dispatch(downloadApplets(cb)),
  sync: cb => dispatch(sync(cb)),
  syncTargetApplet: (appletId, cb) => dispatch(syncTargetApplet(appletId, cb)),
  showToast: toast => dispatch(showToast(toast)),
  setLastActiveTime: time => dispatch(setLastActiveTime(time)),
  setCurrentActivity: activityId => dispatch(setCurrentActivity(activityId))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AppService);
