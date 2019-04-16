import appReducer, { initialState } from './app.reducer';
import {
  setApiHost,
  resetApiHost,
} from './app.actions';

jest.mock('react-native-device-info', () => { });
jest.mock('react-native-fetch-blob', () => { });
jest.mock('react-native-push-notification', () => { });
jest.mock('react-native-router-flux', () => { });
jest.mock('native-base', () => { });

test('it has an initial state', () => {
  expect(appReducer(undefined, { type: 'foo' })).toEqual(initialState);
});

test('it sets api host', () => {
  expect(appReducer(initialState, setApiHost('foobar'))).toEqual({
    ...initialState,
    apiHost: 'foobar',
  });
});

test('it resets api host', () => {
  const state = appReducer(initialState, setApiHost('foobar'));
  expect(appReducer(state, resetApiHost())).toEqual({
    ...initialState,
  });
});
