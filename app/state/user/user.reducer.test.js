import userReducer, { initialState } from './user.reducer';
import { setAuth, setInfo } from './user.actions';

test('it has an initial state', () => {
  expect(userReducer(undefined, { type: 'foo' })).toEqual(initialState);
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
