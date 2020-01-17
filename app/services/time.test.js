import moment from 'moment';
import * as R from 'ramda';
import { Parse, Day } from 'dayspan';
import {
  formatTime,
  getLastScheduled,
  getNextScheduled,
  getScheduledNotifications,
  NOTIFICATION_DATETIME_FORMAT,
} from './time';

const weekdaySchedule = Parse.schedule({
  dayOfWeek: [
    1,
    2,
    3,
    4,
    5,
  ],
});

const onceWeeklySchedule = Parse.schedule({
  dayOfWeek: [
    3,
  ],
});

const oneDaySchedule = Parse.schedule({
  dayOfMonth: [
    12,
  ],
  month: [
    10,
  ],
  year: [
    2019,
  ],
});

const twiceDailyNotifications = [
  {
    end: null,
    notifyIfIncomplete: false,
    random: false,
    start: '12:30',
  },
  {
    end: null,
    notifyIfIncomplete: false,
    random: false,
    start: '18:30',
  },
];

const notificationMoment = R.partialRight(moment, [NOTIFICATION_DATETIME_FORMAT]);

test('schedule next - weekday schedule on a Monday', () => {
  const now = Day.fromDate(new Date(2019, 10, 18, 20, 30, 0));
  const expectedNext = new Date(2019, 10, 19, 0, 0, 0);
  const actualNext = getNextScheduled(weekdaySchedule, now);
  expect(actualNext).toEqual(expectedNext);
});

test('schedule next - weekday schedule on a Friday', () => {
  const now = Day.fromDate(new Date(2019, 10, 22, 20, 30, 0));
  const expectedNext = new Date(2019, 10, 25, 0, 0, 0);
  const actualNext = getNextScheduled(weekdaySchedule, now);
  expect(actualNext).toEqual(expectedNext);
});

test('schedule next - one day schedule in the past', () => {
  const now = Day.fromDate(new Date(2019, 10, 22, 20, 30, 0));
  const expectedNext = null;
  const actualNext = getNextScheduled(oneDaySchedule, now);
  expect(actualNext).toEqual(expectedNext);
});

test('schedule last - weekday schedule on a Monday', () => {
  const now = Day.fromDate(new Date(2019, 10, 25, 20, 30, 0));
  const expectedLast = new Date(2019, 10, 25, 0, 0, 0);
  const actualLast = getLastScheduled(weekdaySchedule, now);
  expect(actualLast).toEqual(expectedLast);
});

test('schedule last - once weekly schedule on a Monday', () => {
  const now = Day.fromDate(new Date(2019, 10, 25, 20, 30, 0));
  const expectedLast = new Date(2019, 10, 20, 0, 0, 0);
  const actualLast = getLastScheduled(onceWeeklySchedule, now);
  expect(actualLast).toEqual(expectedLast);
});

test('schedule last - one day schedule in the future', () => {
  const now = Day.fromDate(new Date(2019, 9, 20, 20, 30, 0));
  const expectedLast = null;
  const actualLast = getLastScheduled(oneDaySchedule, now);
  expect(actualLast).toEqual(expectedLast);
});

test('schedule notifications twice daily on a one day schedule', () => {
  const now = Day.fromDate(new Date(2019, 9, 20, 20, 30, 0));
  const expectedNotifications = [
    notificationMoment('20191112 12:30'),
    notificationMoment('20191112 18:30'),
  ];
  const actualNotifications = getScheduledNotifications(
    oneDaySchedule,
    now,
    twiceDailyNotifications,
  );
  expect(actualNotifications).toEqual(expectedNotifications);
});

test('schedule notifications twice daily on a one day schedule', () => {
  const now = Day.fromDate(new Date(2019, 9, 20, 20, 30, 0));
  const expectedNotifications = [
    notificationMoment('20191112 12:30'), // notifications for next and only day
    notificationMoment('20191112 18:30'),
  ];
  const actualNotifications = getScheduledNotifications(
    oneDaySchedule,
    now,
    twiceDailyNotifications,
  );
  expect(actualNotifications).toEqual(expectedNotifications);
});

test('schedule notifications twice daily on a weekday schedule starting on the weekend', () => {
  const now = Day.fromDate(new Date(2019, 10, 16, 0, 0, 0));
  const expectedNotifications = [
    notificationMoment('20191118 12:30'), // notifications for next 4 days
    notificationMoment('20191118 18:30'),
    notificationMoment('20191119 12:30'),
    notificationMoment('20191119 18:30'),
    notificationMoment('20191120 12:30'),
    notificationMoment('20191120 18:30'),
    notificationMoment('20191121 12:30'),
    notificationMoment('20191121 18:30'),
  ];
  const actualNotifications = getScheduledNotifications(
    weekdaySchedule,
    now,
    twiceDailyNotifications,
  );
  expect(actualNotifications).toEqual(expectedNotifications);
});

test('schedule notifications twice daily on a weekday schedule starting on a Monday', () => {
  const now = Day.fromDate(new Date(2019, 10, 18, 0, 0, 0));
  const expectedNotifications = [
    notificationMoment('20191118 12:30'), // notifications for today
    notificationMoment('20191118 18:30'),
    notificationMoment('20191119 12:30'), // notifications for next 4 days
    notificationMoment('20191119 18:30'),
    notificationMoment('20191120 12:30'),
    notificationMoment('20191120 18:30'),
    notificationMoment('20191121 12:30'),
    notificationMoment('20191121 18:30'),
    notificationMoment('20191122 12:30'),
    notificationMoment('20191122 18:30'),
  ];
  const actualNotifications = getScheduledNotifications(
    weekdaySchedule,
    now,
    twiceDailyNotifications,
  );
  expect(actualNotifications).toEqual(expectedNotifications);
});

test('formats time for today', () => {
  const earlierToday = moment().subtract(2, 'minutes');
  expect(formatTime(earlierToday)).toEqual(`Today at ${moment(earlierToday).format('h:mm A')}`);
});

test('formats time for yesterday', () => {
  const yesterday = moment().subtract(1, 'day');
  expect(formatTime(yesterday)).toEqual(moment(yesterday).format('MMMM D'));
});
