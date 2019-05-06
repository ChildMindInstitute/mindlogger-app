import { combineReducers } from 'redux';
import { reducer as form } from 'redux-form';
import app from './app/app.reducer';
import applets from './applets/applets.reducer';
import responses from './responses/responses.reducer';
import user from './user/user.reducer';

export default combineReducers({
  app,
  applets,
  form,
  responses,
  user,
});
