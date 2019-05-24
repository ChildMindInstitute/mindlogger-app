import {
  checkSkippable,
  getNextPos,
  getLastPos,
  getPrevLabel,
} from './activityNavigation';

jest.mock('../components/screen', () => {});

test('checkSkippable considers allowRefuseToAnswer to be skippable', () => {
  const activity = {
    allowRefuseToAnswer: true,
  };
  expect(checkSkippable(activity)).toBe(true);
});

test('checkSkippable considers allowDoNotKnow to be skippable', () => {
  const activity = {
    allowDoNotKnow: true,
  };
  expect(checkSkippable(activity)).toBe(true);
});

test('checkSkippable returns false if neither are present', () => {
  const activity = {};
  expect(checkSkippable(activity)).toBe(false);
});

test('getNextPos returns the next index', () => {
  const i = 1;
  const ar = [false, true, false, false, true];
  expect(getNextPos(i, ar)).toBe(4);
});

test('getNextPos returns -1 if there is no next index', () => {
  const i = 1;
  const ar = [false, true, false, false, false];
  expect(getNextPos(i, ar)).toBe(-1);
});

test('getNextPos returns -1 if it is the last index', () => {
  const i = 4;
  const ar = [false, true, true, true, true];
  expect(getNextPos(i, ar)).toBe(-1);
});

test('getLastPos returns the last index', () => {
  const i = 4;
  const ar = [false, true, false, false, true];
  expect(getLastPos(i, ar)).toBe(1);
});

test('getLastPos returns -1 if there is no last index', () => {
  const i = 1;
  const ar = [false, true, false, false, false];
  expect(getLastPos(i, ar)).toBe(-1);
});

test('getLastPos returns -1 if it is the first index', () => {
  const i = 0;
  const ar = [true, true, true, true, true];
  expect(getLastPos(i, ar)).toBe(-1);
});

test('getPrevLabel returns Return if it is on the first page', () => {
  const i = 0;
  const ar = [true, true, true, true, true];
  expect(getPrevLabel(i, ar)).toBe('Return');
});

test('getPrevLabel returns Back if it is not on the first page', () => {
  const i = 1;
  const ar = [true, true, true, true, true];
  expect(getPrevLabel(i, ar)).toBe('Back');
});
