import moment from 'moment';
import {
  getNextAndLastTimes,
  sortMomentAr,
  getScheduledCalendarDates,
  getScheduledMonthDays,
  getScheduledWeekDays,
  getDateTimes,
} from './time';

const febraury26 = moment('2019-02-26T00:00:00-0500');
const march1_midnight = moment('2019-03-01T00:00:00-0500');
const march2_midnight = moment('2019-03-02T00:00:00-0500');
const march4_midnight = moment('2019-03-04T00:00:00-0500');
const march4_9am = moment('2019-03-04T09:00:00-0500'); // Monday
const march4_10am = moment('2019-03-04T10:00:00-0500');
const march4_2pm = moment('2019-03-04T14:00:00-0500');
const march7 = moment('2019-03-07T00:00:00-0500'); // Thursday
const march8_midnight = moment('2019-03-08T00:00:00-0500');
const march8_9am = moment('2019-03-08T09:00:00-0500'); // Friday
const march8_10am = moment('2019-03-08T10:00:00-0500');
const march9_midnight = moment('2019-03-09T00:00:00-0500');
const march28_midnight = moment('2019-03-28T00:00:00-0400');

const mockActivityWithoutTimes = {
  meta: {
    notification: {
      advance: false,
      calendarDay: [
        '2019-02-27',
        '2019-03-28',
      ],
      modeDate: true,
      modeMonth: true,
      modeWeek: true,
      monthDay: [
        1,
      ],
      resetDate: true,
      resetTime: true,
      times: [],
      weekDay: [
        1,
        5,
      ],
    },
  },
};

const mockActivityTenAndTwo = {
  meta: {
    notification: {
      advance: false,
      calendarDay: [
        '2019-02-27',
        '2019-03-28',
      ],
      modeDate: true,
      modeMonth: true,
      modeWeek: true,
      monthDay: [
        1,
      ],
      resetDate: true,
      resetTime: true,
      times: [
        { time: '10:00', timeMode: 'scheduled' },
        { time: '14:00', timeMode: 'scheduled' },
        { time: '12:00', timeMode: 'random' },
      ],
      weekDay: [
        1,
        5,
      ],
    },
  },
};

test('getNextAndLastTimes should have a default time of 9:00 AM', () => {
  expect(getNextAndLastTimes(mockActivityWithoutTimes, march7.valueOf()))
    .toEqual({
      last: march4_9am.valueOf(),
      next: march8_9am.valueOf(),
    });
});

test('getNextAndLastTimes should work with multiple times', () => {
  expect(getNextAndLastTimes(mockActivityTenAndTwo, march7.valueOf()))
    .toEqual({
      last: march4_2pm.valueOf(),
      next: march8_10am.valueOf(),
    });
});

test('sortMomentAr', () => {
  const momentAr = [
    march7,
    march8_10am,
    march4_2pm,
    march4_9am,
    march8_9am,
  ];

  expect(JSON.stringify(sortMomentAr(momentAr)))
    .toEqual(JSON.stringify([
      march4_9am,
      march4_2pm,
      march7,
      march8_9am,
      march8_10am,
    ]));
});

test('getScheduledCalendarDates', () => {
  expect(JSON.stringify(getScheduledCalendarDates(mockActivityWithoutTimes, march7)))
    .toEqual(JSON.stringify([march28_midnight]));
});

test('getScheduledMonthDays', () => {
  expect(JSON.stringify(getScheduledMonthDays(mockActivityWithoutTimes, febraury26, march7)))
    .toEqual(JSON.stringify([march1_midnight]));
});

test('getScheduledWeekDays', () => {
  expect(JSON.stringify(getScheduledWeekDays(mockActivityWithoutTimes, march2_midnight, march9_midnight)))
    .toEqual(JSON.stringify([march4_midnight, march8_midnight]));
});

test('getDateTimes', () => {
  const dates = [march4_midnight, march8_midnight];
  const times = [{ time: '10:00', timeMode: 'scheduled' }];
  expect(JSON.stringify(getDateTimes(dates, times)))
    .toEqual(JSON.stringify([march4_10am, march8_10am]));
});
