import userReducer, { initialState } from './user.reducer';
import { setResponseCollectionId } from './user.actions';

jest.mock('react-native-device-info', () => { });

test('it has an initial state', () => {
  expect(userReducer(undefined, { type: 'foo' })).toEqual(initialState);
});

test('it sets response colletion id', () => {
  expect(userReducer(initialState, setResponseCollectionId('999'))).toEqual({
    ...initialState,
    responseCollectionId: '999',
  });
});
