import { combineReducers } from 'redux';
import { reducer as form } from 'redux-form';
import applets from './applets/applets.reducer';
import core from './core/core.reducer';
import drawer from './drawer/drawer.reducer';
import responses from './responses/responses.reducer';
import routes from './routes/routes.reducer';

export default combineReducers({
  applets,
  core,
  drawer,
  form,
  responses,
  routes,
});
