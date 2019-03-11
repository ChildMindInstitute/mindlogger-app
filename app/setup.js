import React from 'react';
import { Provider } from 'react-redux';
import App from './App';
import configureStore from './configureStore';
import { initializePushNotifications } from './services/pushNotifications';

const setup = () => {
  // Set up
  const store = configureStore();
  initializePushNotifications();

  // Root component
  return () => (
    <Provider store={store}>
      <App />
    </Provider>
  );
};

export default setup;
