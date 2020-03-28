import * as R from 'ramda';
import moment from 'moment';
import { getUnscheduled, getScheduled, getPastdue } from './sortActivities';

const unscheduled = {
  // Note the _id prop is used only to help debugging.
  _id: 'Unscheduled',
  lastScheduledTimestamp: null,
  lastResponseTimestamp: null,
  nextScheduledTimestamp: null,
};

const scheduled = {
  _id: 'Scheduled',
  lastScheduledTimestamp: new Date(300),
  lastResponseTimestamp: 500,
  nextScheduledTimestamp: new Date().getTime() + 1000000,
  nextAccess: true,
};

const scheduledNoResponse = {
  _id: 'Scheduled - No Previous Response',
  lastScheduledTimestamp: null,
  lastResponseTimestamp: null,
  nextScheduledTimestamp: new Date().getTime() + 1000000,
  nextAccess: true,
};

const scheduledNoLastScheduled = {
  _id: 'Scheduled - No Last Scheduled',
  lastScheduledTimestamp: null,
  lastResponseTimestamp: 600,
  nextScheduledTimestamp: new Date().getTime() + 1000000,
  nextAccess: true,
};

const overdue = {
  _id: 'Overdue',
  lastScheduledTimestamp: new Date(),
  lastResponseTimestamp: 500,
  nextScheduledTimestamp: 1000,
  lastTimeout: 10000,
};

const overdueBeforeResponse = {
  _id: 'Overdue - No Previous Response',
  lastScheduledTimestamp: new Date(),
  lastResponseTimestamp: null,
  nextScheduledTimestamp: 1000,
  lastTimeout: 10000,
};

const overdueNoNextScheduled = {
  _id: 'Overdue - Nothing Scheduled Next',
  lastScheduledTimestamp: new Date(),
  lastResponseTimestamp: new Date().getTime() + 20000,
  nextScheduledTimestamp: 1000,
  lastTimeout: 10000,
};

const completedWithoutSchedule = {
  _id: 'Completed - Without Schedule',
  lastScheduledTimestamp: null,
  lastResponseTimestamp: 500,
  nextScheduledTimestamp: null,
};

const completedWithSchedule = {
  _id: 'Completed - With Schedule',
  lastScheduledTimestamp: new Date(300),
  lastResponseTimestamp: 600,
  nextScheduledTimestamp: null,
};

const completedNextInThePast = {
  _id: 'Completed - Next Scheduled Activity Past',
  lastScheduledTimestamp: null,
  lastResponseTimestamp: 1500,
  nextScheduledTimestamp: 1000,
};

const SCHEDULED_ACTIVITES = [
  scheduled,
  scheduledNoResponse,
  scheduledNoLastScheduled,
];

const OVERDUE_ACTIVITIES = [
  overdue,
  overdueBeforeResponse,
  overdueNoNextScheduled,
];

const UNSCHEDULED_ACTIVITES = [
  unscheduled,
];

const COMPLETED_ACTIVITIES = [
  completedWithoutSchedule,
  completedWithSchedule,
  completedNextInThePast,
];

const ALL_ACTIVITY_SCENARIOS = [
  ...SCHEDULED_ACTIVITES,
  ...OVERDUE_ACTIVITIES,
  ...UNSCHEDULED_ACTIVITES,
  ...COMPLETED_ACTIVITIES,
];

describe('getUnscheduled', () => {
  test('should return empty array if passed empty list', () => {
    expect(getUnscheduled([])).toEqual([]);
  });

  test('should return array of all activites with no notification times', () => {
    expect(getUnscheduled(UNSCHEDULED_ACTIVITES)).toEqual(UNSCHEDULED_ACTIVITES);
  });
});

describe('getScheduled', () => {
  test('should return empty array if passed empty list', () => {
    expect(getScheduled([])).toEqual([]);
  });

  test('should return empty array if no activities are scheduled', () => {
    expect(getScheduled(R.difference(ALL_ACTIVITY_SCENARIOS, SCHEDULED_ACTIVITES))).toEqual([]);
  });

  test('should return array of all activites with no notification times', () => {
    expect(getScheduled(ALL_ACTIVITY_SCENARIOS)).toEqual(SCHEDULED_ACTIVITES);
  });
});

describe('getPastdue', () => {
  test('should return empty array if passed empty list', () => {
    expect(getPastdue([])).toEqual([]);
  });

  test('should return empty array if no activities are overdue', () => {
    expect(getPastdue(R.difference(ALL_ACTIVITY_SCENARIOS, OVERDUE_ACTIVITIES))).toEqual([]);
  });

  test('should return array of all activites with no notification times', () => {
    expect(getPastdue(ALL_ACTIVITY_SCENARIOS)).toEqual(OVERDUE_ACTIVITIES);
  });
});
