import { Actions } from 'react-native-router-flux';
import * as R from 'ramda';
import USER_CONSTANTS from './user.constants';
import { getResponseCollection } from '../../services/api';
import { userInfoSelector, authTokenSelector } from './user.selectors';
import { sync, showToast } from '../app/app.actions';

export const setInfo = info => ({
  type: USER_CONSTANTS.SET_INFO,
  payload: info,
});

export const setAuth = auth => ({
  type: USER_CONSTANTS.SET_AUTH,
  payload: auth,
});

export const setResponseCollectionId = id => ({
  type: USER_CONSTANTS.SET_RESPONSE_COLLECTION_ID,
  payload: id,
});

export const clearUser = () => ({
  type: USER_CONSTANTS.CLEAR,
});

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
