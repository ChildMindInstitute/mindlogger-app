import appReducer, { initialState } from './app.reducer';
import {
  setApiHost,
  resetApiHost,
  setSkin,
  setCurrentApplet,
  toggleMobileDataAllowed,
} from './app.actions';

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

test('it changes skin', () => {
  const state = appReducer(initialState, setSkin({ name: 'foobar' }));
  expect(state).toEqual({
    ...initialState,
    skin: { name: 'foobar' },
  });
});

test('it sets current applet', () => {
  expect(appReducer(initialState, setCurrentApplet('barfoo'))).toEqual({
    ...initialState,
    currentApplet: 'barfoo',
  });
});

test('it sets current activity', () => {
  expect(appReducer(initialState, setCurrentApplet('activity-123'))).toEqual({
    ...initialState,
    currentApplet: 'activity-123',
  });
});

test('it turns mobile data on and off', () => {
  expect(appReducer(initialState, toggleMobileDataAllowed())).toEqual({
    ...initialState,
    mobileDataAllowed: !initialState.mobileDataAllowed,
  });
});
