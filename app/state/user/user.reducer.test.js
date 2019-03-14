import userReducer, { initialState } from './user.reducer';
import { setResponseCollectionId, setAuth, setInfo } from './user.actions';

jest.mock('react-native-device-info', () => { });
jest.mock('react-native-fetch-blob', () => { });
jest.mock('react-native-push-notification', () => { });
jest.mock('react-native-router-flux', () => { });
jest.mock('native-base', () => { });

test('it has an initial state', () => {
  expect(userReducer(undefined, { type: 'foo' })).toEqual(initialState);
});

test('it sets response colletion id', () => {
  expect(userReducer(initialState, setResponseCollectionId('999'))).toEqual({
    ...initialState,
    responseCollectionId: '999',
  });
});

test('it sets response colletion id', () => {
  expect(userReducer(initialState, setAuth('888'))).toEqual({
    ...initialState,
    auth: '888',
  });
});

test('it sets response colletion id', () => {
  expect(userReducer(initialState, setInfo('777'))).toEqual({
    ...initialState,
    info: '777',
  });
});
