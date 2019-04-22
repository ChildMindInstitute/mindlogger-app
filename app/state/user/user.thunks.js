import { Actions } from 'react-native-router-flux';
import * as R from 'ramda';
import { getResponseCollection } from '../../services/api';
import { userInfoSelector, authTokenSelector } from './user.selectors';
import { showToast } from '../app/app.actions';
import { sync } from '../app/app.thunks';
import {
  setResponseCollectionId,
  setInfo,
  setAuth,
} from './user.actions';

export const fetchResponseCollectionId = () => (dispatch, getState) => {
  const state = getState();
  const user = userInfoSelector(state);
  const authToken = authTokenSelector(state);
  setTimeout(() => {
    getResponseCollection(authToken, user._id)
      .then(id => dispatch(setResponseCollectionId(id)));
  }, 5000);
};

export const signInSuccessful = response => (dispatch) => {
  dispatch(setInfo(response.user));
  dispatch(setAuth(response.authToken));
  dispatch(fetchResponseCollectionId());
  dispatch(sync());
  Actions.replace('activity');
};

export const signUpSuccessful = response => (dispatch) => {
  dispatch(setInfo(R.omit(['authToken'], response)));
  dispatch(setAuth(R.prop('authToken', response)));
  dispatch(fetchResponseCollectionId());
  dispatch(sync());
  Actions.replace('activity');
};

export const updateUserDetailsSuccessful = response => (dispatch) => {
  dispatch(setInfo(response));
  dispatch(showToast({
    text: 'User updated',
    position: 'bottom',
    duration: 2000,
  }));
  Actions.replace('activity');
};
