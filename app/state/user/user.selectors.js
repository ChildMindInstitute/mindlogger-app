import * as R from 'ramda';

export const authSelector = R.path(['user', 'auth']);

export const authTokenSelector = R.path(['user', 'auth', 'token']);

export const userInfoSelector = R.path(['user', 'info']);

export const userTokenBalanceSelector = R.path(['user', 'tokenBalance']);

export const loggedInSelector = R.pathOr(false, ['user', 'auth', 'token']);
