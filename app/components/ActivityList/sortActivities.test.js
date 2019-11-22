import * as R from 'ramda';
import { getUnscheduled, getScheduled, getOverdue, getCompleted } from './sortActivities';

const unscheduled = {
  // Note the _id prop is used only to help debugging.
  _id: 'Unscheduled',
  lastScheduledTimestamp: null,
  lastResponseTimestamp: null,
  nextScheduledTimestamp: null,
};

const scheduled = {
  _id: 'Scheduled',
  lastScheduledTimestamp: 100,
  lastResponseTimestamp: 500,
  nextScheduledTimestamp: 1000,
};

const scheduledNoResponse = {
  _id: 'Scheduled - No Previous Response',
  lastScheduledTimestamp: null,
  lastResponseTimestamp: null,
  nextScheduledTimestamp: 800,
};

const scheduledNoLastScheduled = {
  _id: 'Scheduled - No Last Scheduled',
  lastScheduledTimestamp: null,
  lastResponseTimestamp: 600,
  nextScheduledTimestamp: 1200,
};

const overdue = {
  _id: 'Overdue',
  lastScheduledTimestamp: 600,
  lastResponseTimestamp: 500,
  nextScheduledTimestamp: 1000,
};

const overdueBeforeResponse = {
  _id: 'Overdue - No Previous Response',
  lastScheduledTimestamp: 600,
  lastResponseTimestamp: null,
  nextScheduledTimestamp: 1000,
};

const overdueNoNextScheduled = {
  _id: 'Overdue - Nothing Scheduled Next',
  lastScheduledTimestamp: 700,
  lastResponseTimestamp: 400,
  nextScheduledTimestamp: null,
};

const overdueOnlyLastScheduled = {
  _id: 'Overdue - No Response & Nothing Scheduled Next',
  lastScheduledTimestamp: 700,
  lastResponseTimestamp: null,
  nextScheduledTimestamp: null,
};

const completedWithoutSchedule = {
  _id: 'Completed - Without Schedule',
  lastScheduledTimestamp: null,
  lastResponseTimestamp: 500,
  nextScheduledTimestamp: null,
};

const completedWithSchedule = {
  _id: 'Completed - With Schedule',
  lastScheduledTimestamp: 300,
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
  overdueOnlyLastScheduled,
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

  test('should return empty array if all activites have notification times', () => {
    expect(getUnscheduled(R.difference(ALL_ACTIVITY_SCENARIOS, UNSCHEDULED_ACTIVITES))).toEqual([]);
  });

  test('should return array of all activites with no notification times', () => {
    expect(getUnscheduled(ALL_ACTIVITY_SCENARIOS)).toEqual(UNSCHEDULED_ACTIVITES);
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

describe('getCompleted', () => {
  test('should return empty array if passed empty list', () => {
    expect(getCompleted([])).toEqual([]);
  });

  test('should return empty array if no activities are completedWithoutSchedule', () => {
    expect(getCompleted(R.difference(ALL_ACTIVITY_SCENARIOS, COMPLETED_ACTIVITIES))).toEqual([]);
  });

  test('should return array of all activites with no notification times', () => {
    expect(getCompleted(ALL_ACTIVITY_SCENARIOS)).toEqual(COMPLETED_ACTIVITIES);
  });
});

describe('getOverdue', () => {
  test('should return empty array if passed empty list', () => {
    expect(getOverdue([])).toEqual([]);
  });

  test('should return empty array if no activities are overdue', () => {
    expect(getOverdue(R.difference(ALL_ACTIVITY_SCENARIOS, OVERDUE_ACTIVITIES))).toEqual([]);
  });

  test('should return array of all activites with no notification times', () => {
    expect(getOverdue(ALL_ACTIVITY_SCENARIOS)).toEqual(OVERDUE_ACTIVITIES);
  });
});
