import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import core from './core';
import drawer from './drawer';
import routes from './routes';

export default combineReducers({
  form: formReducer,
  drawer,
  routes,
  core
});
