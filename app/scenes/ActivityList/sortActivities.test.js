import { getUnscheduled, getScheduled, getOverdue, getCompleted } from './sortActivities';

const unscheduled = {
  _id: 'unscheduledA',
  lastScheduledTimestamp: null,
  lastResponseTimestamp: null,
  nextScheduledTimestamp: null,
};

const scheduled = {
  _id: 'monday',
  lastScheduledTimestamp: 100,
  lastResponseTimestamp: 500,
  nextScheduledTimestamp: 1000,
};

const overdue = {
  _id: 'monday',
  lastScheduledTimestamp: 600,
  lastResponseTimestamp: 500,
  nextScheduledTimestamp: 1000,
};

const completed = {
  _id: 'monday',
  lastScheduledTimestamp: null,
  lastResponseTimestamp: 500,
  nextScheduledTimestamp: null,
};

describe('getUnscheduled', () => {
  test('should return empty array if passed empty list', () => {
    expect(getUnscheduled([])).toEqual([]);
  });

  test('should return empty array if all activites have notification times', () => {
    expect(getUnscheduled([overdue, scheduled, completed])).toEqual([]);
  });

  test('should return array of all activites with no notification times', () => {
    expect(getUnscheduled([scheduled, overdue, unscheduled, completed])).toEqual([unscheduled]);
  });
});

describe('getScheduled', () => {
  test('should return empty array if passed empty list', () => {
    expect(getScheduled([])).toEqual([]);
  });

  test('should return empty array if no activities are scheduled', () => {
    expect(getScheduled([overdue, unscheduled, completed])).toEqual([]);
  });

  test('should return array of all activites with no notification times', () => {
    expect(getScheduled([scheduled, overdue, unscheduled, completed])).toEqual([scheduled]);
  });
});

describe('getCompleted', () => {
  test('should return empty array if passed empty list', () => {
    expect(getCompleted([])).toEqual([]);
  });

  test('should return empty array if no activities are completed', () => {
    expect(getCompleted([scheduled, overdue, unscheduled])).toEqual([]);
  });

  test('should return array of all activites with no notification times', () => {
    expect(getCompleted([scheduled, overdue, unscheduled, completed])).toEqual([completed]);
  });
});

describe('getOverdue', () => {
  test('should return empty array if passed empty list', () => {
    expect(getOverdue([])).toEqual([]);
  });

  test('should return empty array if no activities are overdue', () => {
    expect(getOverdue([scheduled, unscheduled, completed])).toEqual([]);
  });

  test('should return array of all activites with no notification times', () => {
    expect(getOverdue([scheduled, overdue, unscheduled, completed])).toEqual([overdue]);
  });
});
