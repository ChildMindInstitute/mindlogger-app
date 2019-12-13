import React from 'react';
import { Platform } from 'react-native';
import { Provider } from 'react-redux';
import { Root } from 'native-base';
import { Actions } from 'react-native-router-flux';
import moment from 'moment';
import AppNavigator from './scenes/AppNavigator';
import configureStore from './store';
import { initializePushNotifications } from './services/pushNotifications';
import { sync } from './state/app/app.thunks';
import { clearUser } from './state/user/user.actions';
import { setCurrentActivity, setCurrentApplet } from './state/app/app.actions';
import { startFreshResponse } from './state/responses/responses.thunks';
import { currentAppletSelector } from './state/app/app.selectors';

const checkAuthToken = (store) => {
  const state = store.getState();
  if (state.user.auth === null) {
    store.dispatch(clearUser()); // Just in case
    return false;
  }

  const resetBaseCount = () => {
    PushNotificationIOS.setApplicationIconBadgeNumber(0)
  }

  const authExpiration = moment(state.user.auth.expires);
  if (moment().isAfter(authExpiration)) {
    store.dispatch(clearUser()); // Auth token expired
    return false;
  }

  return true;
};

const setInitialScreen = (authOk, state) => {
  if (!authOk) {
    Actions.replace('login');
  } else if (state.app.currentApplet && currentAppletSelector(state)) {
    Actions.replace('applet_details');
  } else {
    Actions.replace('applet_list');
  }
};

const setup = () => {
  (Platform.OS == 'ios' &&
    resetBaseCount())
  const store = configureStore(() => {
    const authOk = checkAuthToken(store);
    setInitialScreen(authOk, store.getState());
    if (authOk) {
      store.dispatch(sync());
    }

    initializePushNotifications((notification) => {
      const state = store.getState();
      // If user is logged in when they get a push notification, go to the home

      if (state.user.auth && !notification.foreground) {
        // On Android the activity object comes back already parsed in the data property
        // On iOS the activity from userInfo.activity comes back as a JSON string in data.activity
        const activity = Platform.OS === 'android'
          ? notification.data
          : JSON.parse(notification.data.activity);

        store.dispatch(setCurrentApplet(activity.appletId));
        store.dispatch(setCurrentActivity(activity.id));
        const resp = startFreshResponse(activity);
        resp(store.dispatch, store.getState);
      }
    });
  });

  // Root component
  return () => (
    <Provider store={store}>
      <Root>
        <AppNavigator />
      </Root>
    </Provider>
  );
};

export default setup;
