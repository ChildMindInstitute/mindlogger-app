import responsesReducer, { initialState } from './responses.reducer';
import {
  replaceResponses,
  setDownloadingResponses,
  setResponsesDownloadProgress,
  removeResponseInProgress,
  createResponseInProgress,
  setAnswer,
  addToUploadQueue,
  shiftUploadQueue,
  setSchedule,
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

test('it creates a response in progress', () => {
  const appletId = 'myApplet';
  const activity = { id: 'myActivity', foo: 'bar', items: [{}] };
  expect(responsesReducer(initialState, createResponseInProgress(appletId, activity))).toEqual({
    ...initialState,
    inProgress: {
      myAppletmyActivity: {
        activity,
        responses: [undefined],
        screenIndex: 0,
      },
    },
  });
});

test('it removes response in progress', () => {
  const appletId = 'myApplet';
  const activity = { id: 'myActivity', foo: 'bar', items: [{}] };
  const oneResponseState = responsesReducer(initialState, createResponseInProgress(appletId, activity));
  expect(responsesReducer(oneResponseState, removeResponseInProgress('myAppletmyActivity'))).toEqual({
    ...initialState,
    inProgress: {},
  });
});

test('it sets an answer', () => {
  const appletId = 'myApplet';
  const activity = { id: 'myActivity', foo: 'bar', items: [{}] };
  const oneResponseState = responsesReducer(initialState, createResponseInProgress(appletId, activity));
  expect(responsesReducer(oneResponseState, setAnswer('myApplet', 'myActivity', 0, 'foobar'))).toEqual({
    ...initialState,
    inProgress: {
      myAppletmyActivity: {
        activity,
        responses: ['foobar'],
        screenIndex: 0,
      },
    },
  });
});

test('it adds to the upload queue', () => {
  expect(responsesReducer(initialState, addToUploadQueue('newItem'))).toEqual({
    ...initialState,
    uploadQueue: ['newItem'],
  });
});

test('it adds to the upload queue', () => {
  const oneItem = responsesReducer(initialState, addToUploadQueue('itemA'));
  const twoItems = responsesReducer(oneItem, addToUploadQueue('itemB'));
  expect(responsesReducer(twoItems, shiftUploadQueue())).toEqual({
    ...initialState,
    uploadQueue: ['itemB'],
  });
});

test('it sets the schedule', () => {
  expect(responsesReducer(initialState, setSchedule('schedule'))).toEqual({
    ...initialState,
    schedule: 'schedule',
  });
});
