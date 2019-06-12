import mediaReducer, { initialState } from './media.reducer';
import { addMediaFile, removeMediaFile, clearMedia } from './media.actions';

test('it has an initial state', () => {
  expect(mediaReducer(undefined, { type: 'foo' })).toEqual(initialState);
});

test('it adds a media file', () => {
  expect(mediaReducer(initialState, addMediaFile('https://some.cool/file.jpg', '1337'))).toEqual({
    ...initialState,
    mediaMap: {
      'https://some.cool/file.jpg': '1337',
    },
  });
});

test('it removes a media file', () => {
  const newState = mediaReducer(initialState, addMediaFile('https://some.cool/file.jpg', '1337'));
  expect(mediaReducer(newState, removeMediaFile('https://some.cool/file.jpg'))).toEqual({
    ...initialState,
  });
});

test('it clears all media', () => {
  const stateOne = mediaReducer(initialState, addMediaFile('https://some.cool/file.jpg', '1337'));
  const stateTwo = mediaReducer(stateOne, addMediaFile('https://some.cool/another.jpg', '2222'));
  expect(mediaReducer(stateTwo, clearMedia('https://some.cool/file.jpg'))).toEqual({
    ...initialState,
  });
});
