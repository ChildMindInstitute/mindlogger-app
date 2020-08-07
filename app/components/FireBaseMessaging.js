import React, { Component, Fragment } from 'react';
import { Alert, Platform, AppState, AppStateStatus, Linking } from 'react-native';
import PropTypes from 'prop-types';
import * as firebase from 'react-native-firebase';
import { connect } from 'react-redux';
import _ from 'lodash';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

import { Actions } from 'react-native-router-flux';
import moment from 'moment';
import { setFcmToken } from '../state/fcm/fcm.actions';
import { appletsSelector } from '../state/applets/applets.selectors';
import { setCurrentApplet, setAppStatus } from '../state/app/app.actions';
import { startResponse } from '../state/responses/responses.thunks';
import { inProgressSelector } from '../state/responses/responses.selectors';
import { updateBadgeNumber } from '../state/applets/applets.thunks';
import { syncTargetApplet, sync } from '../state/app/app.thunks';

const AndroidChannelId = 'MindLoggerChannelId';
const fMessaging = firebase.messaging.nativeModuleExists && firebase.messaging();
const fNotifications = firebase.notifications.nativeModuleExists && firebase.notifications();

const isAndroid = Platform.OS === 'android';
const isIOS = Platform.OS === 'ios';

class FireBaseMessaging extends Component {
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

    AppState.addEventListener('change', this.handleAppStateChange);

    if (isAndroid) {
      this.initAndroidChannel();
    }

    if (isIOS) {
      firebase.messaging().ios.registerForRemoteNotifications();
    }

    this.requestPermissions();
    this.props.setFCMToken(await fMessaging.getToken());

    const event = await fNotifications.getInitialNotification()

    if (event) {
      this.openActivityByEventId(event);
    }
  }

  /**
   * Removes all event listeners set on component creation.
   *
   * @returns {void}
   */
  componentWillUnmount() {
    this.listeners.forEach(removeListener => removeListener());
    AppState.removeEventListener('change', this.handleAppStateChange);
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
      await fMessaging.requestPermission()
    } catch (error) {
      // If the user denied permissions.
      Alert.alert(
        '"MindLogger" would like to send you notifications',
        'These can be configured in Settings',
        [
          {
            text: 'Dismiss',
            style: 'cancel',
          },
          {
            text: 'Open Settings',
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
    && (moment().isSame(moment(activity.lastResponseTimestamp), 'day'));

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
    const activity = applet.activities.find(({ id }) => id.endsWith(activityId));

    if (activity) {
      return activity;
    }

    const event = applet.schedule.events.find(({ id }) => id === eventId);

    if (!event) {
      return null;
    }

    return applet.activities.find(({ schema }) => schema === event.data.URI);
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
    const eventId = _.get(notificationObj, 'notification._data.event_id', '');
    const appletId = _.get(notificationObj, 'notification._data.applet_id', '');
    const activityId = _.get(notificationObj, 'notification._data.activity_id', '');

    // Ignore the notification if some data is missing.
    if (!eventId || !appletId || !activityId) return;

    const applet = this.props.applets.find(({ id }) => id.endsWith(appletId));

    if (!applet) {
      return Alert.alert(
        'Applet was not found', 'There is no applet for given id.'
      );
    }
    
    let activity = applet.activities.find(({ id }) => id.endsWith(activityId));
    
    if (activity) {
      return this.prepareAndOpenActivity(applet, activity);
    }

    if (Actions.currentScene !== 'applet_list') {
      Actions.push('applet_list');
    }

    // If the activity ID is not found in the applet, that means the applet is 
    // out of sync.
    this.props.syncTargetApplet(appletId, () => {
      activity = this.findActivityById(eventId, applet, activityId);
      this.prepareAndOpenActivity(applet, activity, appletId);
    });
  };

  /**
   * Returns the given date as the number of miliseconds elapsed since the UNIX
   * epoch.
   *
   * @param {Date} date the date to be converted to miliseconds.
   *
   * @returns {number} the corresponding number of miliseconds.
   */
  getMilliseconds = date => (date ? moment(date).toDate().getTime() : 0);

  /**
   *
   *
   * @returns {void}
   */
  prepareAndOpenActivity = (applet, activity) => {
    if (!activity) {
      return Alert.alert(
        'Activity was not found', 'There is no activity for given id.'
      );
    }

    const isActivityCompleted = this.isActivityCompleted(applet, activity);

    this.props.setCurrentApplet(applet.id);

    if (isActivityCompleted) {
      Actions.push('applet_details', { initialTab: 'data' });
      return Alert.alert(
        '', 
        `You have already completed ‘${activity.name.en}’`,
      );
    }

    if (Actions.currentScene === 'applet_details') {
      Actions.replace('applet_details');
    } else {
      Actions.push('applet_details');
    }

    const currentDate = new Date();

    if (activity.lastScheduledTimestamp && activity.lastTimeout) {
      const deltaTime = currentDate.getTime()
        - this.getMilliseconds(activity.lastScheduledTimestamp)
        - activity.lastTimeout;

      if (deltaTime >= 0) {
        const time = moment(activity.lastScheduledTimestamp).format('HH:mm');

        return Alert.alert(
          '', 
          (`This activity was due at ${time}. If progress was made on the ` +
          `${activity.name.en}, it was saved but it can no longer be taken ` +
          `today.`)
        );
      }
    }

    let deltaTime = currentDate.getTime()
      - this.getMilliseconds(activity.nextScheduledTimestamp);

    if (activity.nextScheduledTimestamp && moment(currentDate).isBefore(moment(activity.nextScheduledTimestamp), 'day')) {
      deltaTime = 0;
    }

    if (activity.nextAccess || deltaTime >= 0) {
      this.props.startResponse(activity);
    } else {
      const time = moment(activity.nextScheduledTimestamp).format('HH:mm');

      Alert.alert(
        'Activity not ready', 
        (`You’re not able to start activity yet, ‘${activity.name.en}’ is ` +
        `scheduled to start at ${time} today`)
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
    await firebase.notifications().android.createChannel(channel)
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
      await this.updateApplicationIconBadgeNumber();
    }
  };

  /**
   * Returns a promise that resolves to the delivered notifications count.
   *
   * @returns {Promise} promise that resolves to the notification count.
   */
  getDeliveredNotificationsCount() : Promise<number> {
    return new Promise(resolve =>
      PushNotificationIOS
        .getDeliveredNotifications(({ length }) => resolve(length))
    );
  }

  /**
   *
   */
  getScheduledLocalNotificationsCount() : Promise<number> {
    return new Promise(resolve =>
      PushNotificationIOS
        .getScheduledLocalNotifications(({ length }) => resolve(length))
    );
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
  onNotification = async (notification: firebase.RNFirebase.notifications.Notification) => {
    const localNotification = this.newNotification({
      notificationId: notification.notificationId,
      title: notification.title,
      subtitle: notification.subtitle,
      body: notification.body,
      data: notification.data,
      // iosBadge: notification.ios.badge,
    });

    if (isIOS) {
      const notificationsCount = await this.generateApplicationIconBadgeNumber();
      localNotification.ios.setBadge(notificationsCount);
    }

    try {
      await firebase
        .notifications()
        .displayNotification(localNotification);
    } catch(error) {
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
    this.openActivityByEventId(notificationOpen);

    if (isIOS) {
      const iconBadgeNumber = await this.updateApplicationIconBadgeNumber();
      this.props.updateBadgeNumber(iconBadgeNumber);
    }
  };

  /**
   * Updates the notifications badge number for iOS.
   *
   * @returns {number} the notification count.
   */
  updateApplicationIconBadgeNumber = async () => {
    const iconBadgeNumber = await this.generateApplicationIconBadgeNumber();

    PushNotificationIOS.setApplicationIconBadgeNumber(iconBadgeNumber);
    return iconBadgeNumber;
  }

  /**
   * Calculates the total badge number.
   *
   * @returns {number} the total notification count.
   */
  generateApplicationIconBadgeNumber = async () => {
    const deliveredNotificationsCount = await this.getDeliveredNotificationsCount();
    const scheduledLocalNotificationsCount = await this.getScheduledLocalNotificationsCount();

    return deliveredNotificationsCount + scheduledLocalNotificationsCount;
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
      // iosBadge: prevBadges + 1,
    });

    if (isIOS) {
      const notificationsCount = await this.generateApplicationIconBadgeNumber();
      localNotification.ios.setBadge(notificationsCount + 1);
    }

    try {
      await firebase
        .notifications()
        .displayNotification(localNotification);
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
  isBackgroundState= state => state?.match(/inactive|background/);

  /**
   * Handles the switching of the app from foreground to background or the other
   * way around.
   *
   * @param {string} nextAppState the state the app is switching to.
   *
   * @returns {void}
   */
  handleAppStateChange = async (nextAppState: AppStateStatus) => {
    const { setAppStatus, updateBadgeNumber } = this.props;
    const goingToBackground = this.isBackgroundState(nextAppState) && this.appState === 'active';
    const goingToForeground = this.isBackgroundState(this.appState) && nextAppState === 'active';
    const stateChanged = nextAppState !== this.appState;

    if (goingToBackground) {
      setAppStatus(false);
    } else if (goingToForeground) {
      setAppStatus(true);
    }

    if (stateChanged && isIOS) {
      const badgeNumber = await this.updateApplicationIconBadgeNumber();
      updateBadgeNumber(badgeNumber);
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

    return (
      <Fragment>
        {children}
      </Fragment>
    );
  }
}

FireBaseMessaging.propTypes = {
  children: PropTypes.node.isRequired,
  setFCMToken: PropTypes.func.isRequired,
  applets: PropTypes.array.isRequired,
  setAppStatus: PropTypes.func.isRequired,
  inProgress: PropTypes.object,
  setCurrentApplet: PropTypes.func.isRequired,
  startResponse: PropTypes.func.isRequired,
  updateBadgeNumber: PropTypes.func.isRequired,
  syncTargetApplet: PropTypes.func.isRequired,
};

FireBaseMessaging.defaultProps = {
  inProgress: {},
};

const mapStateToProps = state => ({
  applets: appletsSelector(state),
  inProgress: inProgressSelector(state),
});

const mapDispatchToProps = dispatch => ({
  setFCMToken: (token) => {
    dispatch(setFcmToken(token));
  },
  setAppStatus: appStatus => dispatch(setAppStatus(appStatus)),
  setCurrentApplet: id => dispatch(setCurrentApplet(id)),
  startResponse: activity => dispatch(startResponse(activity)),
  updateBadgeNumber: badgeNumber => dispatch(updateBadgeNumber(badgeNumber)),
  sync: cb => dispatch(sync(cb)),
  syncTargetApplet: (appletId, cb) => dispatch(syncTargetApplet(appletId, cb)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FireBaseMessaging);
