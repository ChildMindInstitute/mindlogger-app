import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import core from './core/core.reducer';
import drawer from './drawer/drawer.reducer';
import routes from './routes/routes.reducer';

export default combineReducers({
  form: formReducer,
  drawer,
  routes,
  core,
});
