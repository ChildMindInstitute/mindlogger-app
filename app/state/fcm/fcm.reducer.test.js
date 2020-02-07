import fcmReducer, { initialState } from './fcm.reducer';
import { setFcmToken } from './fcm.actions';

test('it has an initial state', () => {
  expect(fcmReducer(undefined, { type: 'foo' })).toEqual(initialState);
});

test('it sets fcmToken', () => {
  expect(fcmReducer(initialState, setFcmToken('1111111'))).toEqual({
    ...initialState,
    fcmToken: '1111111',
  });
});
