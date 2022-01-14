import { Actions } from 'react-native-router-flux';
import * as R from 'ramda';
import { sync, showToast } from '../app/app.thunks';
import { setInfo, setAuth, setLanguage } from './user.actions';

import { getUserUpdates } from '../../services/network';
import { refreshTokenBehaviors } from '../responses/responses.thunks';

export const signInSuccessful = response => (dispatch) => {
  dispatch(setInfo(response.user));
  dispatch(setAuth(response.authToken));
  dispatch(
    sync(() => getUserUpdates({
      authToken: response.authToken.token,
    }).then(() => dispatch(refreshTokenBehaviors())), response.keys),
  );
  Actions.replace('applet_list');
};

export const signUpSuccessful = response => (dispatch) => {
  dispatch(setInfo(R.omit(['authToken'], response)));
  dispatch(setAuth(R.prop('authToken', response)));
  dispatch(sync());
  Actions.replace('applet_list');
};

export const updateUserDetailsSuccessful = response => (dispatch) => {
  dispatch(setInfo(response));
  dispatch(
    showToast({
      text: 'Password updated',
      position: 'bottom',
      duration: 2000,
    }),
  );
  Actions.replace('applet_list');
};
