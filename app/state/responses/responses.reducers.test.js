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

const RealDate = Date.now;

beforeAll(() => {
  global.Date.now = jest.fn(() => new Date('2022-05-07T10:20:30Z').getTime())
})

afterAll(() => {
  global.Date.now = RealDate
})

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
  const timeStarted = Date.now();
  const subjectId = '8a9c3m2n0s19f';
  const activity = { id: 'Event', foo: 'bar', items: [{}] }; 
  expect(responsesReducer(initialState, createResponseInProgress(appletId, activity, subjectId, timeStarted, activity.items))).toEqual({
    ...initialState,
    inProgress: {
      [activity.id]: {
        activity,
        responses: [undefined],
        events: [],
        screenIndex: 0,
        subjectId,
        timeStarted,
        isSummaryScreen: false
      },
    }
  });
});

test('it removes response in progress', () => {
  const appletId = 'myApplet';
  const subjectId = '8a9c3m2n0s19f';
  const timeStarted = Date.now();
  const activity = { id: 'myActivity', foo: 'bar', items: [{}] };
  const oneResponseState = responsesReducer(initialState, createResponseInProgress(appletId, activity, subjectId, Date.now(), activity.items));
  expect(responsesReducer(oneResponseState, removeResponseInProgress('myAppletmyActivity'))).toEqual({
    ...initialState,
    inProgress: {
      [activity.id]: {
        activity,
        responses: [undefined],
        events: [],
        screenIndex: 0,
        subjectId,
        timeStarted,
        isSummaryScreen: false
      },
    }
  });
});

test('it sets an answer', () => {
  const appletId = 'myApplet';
  const subjectId = '8a9c3m2n0s19f';
  const activity = { id: 'myActivity', foo: 'bar', items: [{}] };
  const now = Date.now();
  const oneResponseState = responsesReducer(initialState, createResponseInProgress(appletId, activity, subjectId, now, activity.items));
  expect(responsesReducer(oneResponseState, setAnswer(activity, 0, 'foobar'))).toEqual({
    ...initialState,
    inProgress: {
      [activity.id]: {
        activity,
        responses: ['foobar'],
        events: [],
        isSplashScreen: undefined,
        screenIndex: 0,
        subjectId,
        timeStarted: now,
        isSummaryScreen: false,
        [0]: {
          responseTime: now
        }
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

