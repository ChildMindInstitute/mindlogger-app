import appletReducer, { initialState } from './applets.reducer';
import {
  replaceApplets,
  setDownloadingApplets,
  setNotifications,
} from './applets.actions';

test('it has an initial state', () => {
  expect(appletReducer(undefined, { type: 'foo' })).toEqual(initialState);
});

test('it replaces applets', () => {
  expect(appletReducer(initialState, replaceApplets([
    'foo',
    'bar',
  ]))).toEqual({
    ...initialState,
    applets: [
      'foo',
      'bar',
    ],
    currentTime: new Date(),
  });
});

test('it sets downloading assets flag', () => {
  expect(appletReducer(initialState, setDownloadingApplets(true))).toEqual({
    ...initialState,
    isDownloadingApplets: true,
  });
});

test('it sets notifications', () => {
  expect(appletReducer(initialState, setNotifications('test'))).toEqual({
    ...initialState,
    notifications: 'test',
  });
});
