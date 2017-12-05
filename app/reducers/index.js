import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import core from './core';
import drawer from './drawer';
import routes from './routes';

import survey from '../modules/survey/reducer';
import voice from '../modules/voice/reducer';

export default combineReducers({
  form: formReducer,
  drawer,
  routes,
  core,
  survey,
  voice,
});
