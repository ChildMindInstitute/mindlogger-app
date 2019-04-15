import { combineReducers } from 'redux';
import { reducer as form } from 'redux-form';
import applets from './applets/applets.reducer';
import drawer from './drawer/drawer.reducer';
import responses from './responses/responses.reducer';
import user from './user/user.reducer';
import app from './app/app.reducer';

export default combineReducers({
  applets,
  drawer,
  form,
  responses,
  user,
  app,
});
