import appletReducer, { initialState } from './applets.reducer';
import { replaceApplets, setDownloadingApplets, setAppletDownloadProgress } from './applets.actions';

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
  });
});

test('it sets downloading assets flag', () => {
  expect(appletReducer(initialState, setDownloadingApplets(true))).toEqual({
    ...initialState,
    isDownloadingApplets: true,
  });
});

test('it sets applet download progress', () => {
  expect(appletReducer(initialState, setAppletDownloadProgress(1, 3))).toEqual({
    ...initialState,
    downloadProgress: {
      downloaded: 1,
      total: 3,
    },
  });
});
