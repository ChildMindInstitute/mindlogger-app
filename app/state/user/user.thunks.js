import { Actions } from 'react-native-router-flux';
import * as R from 'ramda';
import { userInfoSelector, authTokenSelector } from './user.selectors';
import { sync, showToast } from '../app/app.thunks';
import {
  setInfo,
  setAuth,
} from './user.actions';

export const signInSuccessful = response => (dispatch) => {
  dispatch(setInfo(response.user));
  dispatch(setAuth(response.authToken));
  dispatch(sync());
  Actions.replace('activity');
};

export const signUpSuccessful = response => (dispatch) => {
  dispatch(setInfo(R.omit(['authToken'], response)));
  dispatch(setAuth(R.prop('authToken', response)));
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
