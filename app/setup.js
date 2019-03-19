import React from 'react';
import { Provider } from 'react-redux';
import { Root } from 'native-base';
import { Actions } from 'react-native-router-flux';
import moment from 'moment';
import AppNavigator from './scenes/AppNavigator';
import configureStore from './configureStore';
import { initializePushNotifications } from './services/pushNotifications';
import { sync } from './state/app/app.actions';
import { clearUser, fetchResponseCollectionId } from './state/user/user.actions';

const checkAuthToken = (store) => {
  const state = store.getState();
  if (state.user.auth === null) {
    store.dispatch(clearUser()); // Just in case
    return false;
  }

  const authExpiration = moment(state.user.auth.expires);
  if (moment().isAfter(authExpiration)) {
    store.dispatch(clearUser()); // Auth token expired
    return false;
  }

  // Response collection id is the folder we will upload responses to
  if (!state.user.responseCollectionId === null) {
    store.dispatch(fetchResponseCollectionId());
  }

  return true;
};

const setInitialScreen = (authOk) => {
  if (!authOk) {
    Actions.replace('login');
  } else {
    Actions.replace('activity');
  }
};

const setup = () => {
  // Set up
  const store = configureStore(() => {
    const authOk = checkAuthToken(store);
    setInitialScreen(authOk);
    if (authOk) {
      store.dispatch(sync());
    }
  });

  initializePushNotifications();

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
