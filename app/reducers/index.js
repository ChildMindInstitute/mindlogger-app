import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import core from './core';
import drawer from './drawer';
import routes from './routes';
import cardNavigation from './cardNavigation';
import survey from '../modules/survey/reducer';
import audio from '../modules/audio/reducer';

export default combineReducers({
  form: formReducer,
  drawer,
  cardNavigation,
  routes,
  core,
  survey,
  audio,
});
