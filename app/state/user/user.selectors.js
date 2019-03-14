import * as R from 'ramda';

export const responseCollectionIdSelector = R.path(['user', 'responseCollectionId']);

export const authSelector = R.path(['user', 'auth']);

export const authTokenSelector = R.path(['user', 'auth', 'token']);

export const userInfoSelector = R.path(['user', 'info']);
