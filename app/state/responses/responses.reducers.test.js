import responsesReducer, { initialState } from './responses.reducer';
import {
  replaceResponses,
  setDownloadingResponses,
  setResponsesDownloadProgress,
  setCurrentActivity,
  updateResponseInProgress,
  removeResponseInProgress,
  createResponseInProgress,
} from './responses.actions';

test('it has an initial state', () => {
  expect(responsesReducer(undefined, { type: 'foo' })).toEqual(initialState);
});

test('it replaces response history', () => {
  expect(responsesReducer(initialState, replaceResponses([
    'foo',
    'bar',
  ]))).toEqual({
    ...initialState,
    responseHistory: [
      'foo',
      'bar',
    ],
  });
});

test('it sets downloading responses flag', () => {
  expect(responsesReducer(initialState, setDownloadingResponses(true))).toEqual({
    ...initialState,
    isDownloadingResponses: true,
  });
});

test('it sets responses download progress', () => {
  expect(responsesReducer(initialState, setResponsesDownloadProgress(1, 3))).toEqual({
    ...initialState,
    downloadProgress: {
      downloaded: 1,
      total: 3,
    },
  });
});

test('it sets current activity', () => {
  expect(responsesReducer(initialState, setCurrentActivity('abcde'))).toEqual({
    ...initialState,
    currentActivity: 'abcde',
  });
});

test('it creates a response in progress', () => {
  const activity = { _id: 'myActivity', foo: 'bar' };
  expect(responsesReducer(initialState, createResponseInProgress(activity))).toEqual({
    ...initialState,
    inProgress: {
      myActivity: {
        activity: {
          _id: 'myActivity',
          foo: 'bar',
        },
        responses: {},
      },
    },
  });
});

test('it removes response in progress', () => {
  const activity = { _id: 'myActivity', foo: 'bar' };
  const oneResponseState = responsesReducer(initialState, createResponseInProgress(activity));
  expect(responsesReducer(oneResponseState, removeResponseInProgress('myActivity'))).toEqual({
    ...initialState,
    inProgress: {},
  });
});

test('it updates response in progress', () => {
  const activity = { _id: 'myActivity', foo: 'bar' };
  const oneResponseState = responsesReducer(initialState, createResponseInProgress(activity));
  expect(responsesReducer(oneResponseState, updateResponseInProgress('myActivity', { hey: 'yo' }))).toEqual({
    ...initialState,
    inProgress: {
      myActivity: {
        activity,
        responses: { hey: 'yo' },
      },
    },
  });
});
