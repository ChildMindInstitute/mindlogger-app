import * as R from 'ramda';
import USER_CONSTANTS from './user.constants';
import { getFolders } from '../../services/network';

export const setResponseCollectionId = id => ({
  type: USER_CONSTANTS.SET_RESPONSE_COLLECTION_ID,
  payload: id,
});

export const fetchResponseCollectionId = () => (dispatch, getState) => {
  // To do: move all user info into the `user` reducer and out of `core.self`
  // and `core.auth`
  const { core } = getState();
  const userId = R.path(['self', '_id'], core);
  const authToken = R.path(['auth', 'token'], core);

  if (!authToken || !userId) {
    return;
  }

  getFolders(authToken, userId, 'user')
    .then((folders) => {
      if (folders.length > 0) {
        dispatch(setResponseCollectionId(folders[0]._id));
      }
    });
};
