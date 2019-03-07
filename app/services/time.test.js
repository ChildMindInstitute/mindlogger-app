import moment from 'moment';
import {
  getLastScheduledWeekdays,
  getLastScheduledMonthDays,
  getLastScheduledCalendarDates,
  getUpcomingScheduledWeekdays,
  getUpcomingScheduledMonthDays,
  getUpcomingScheduledCalendarDates,
} from './time';

const feb28 = moment('2019-02-28T00:00:00-0500'); // Wednesday
const march5 = moment('2019-03-05T00:00:00-0500'); // Tuesday
const march6 = moment('2019-03-06T00:00:00-0500'); // Wednesday
const march7 = moment('2019-03-07T00:00:00-0500'); // Thursday
const march8 = moment('2019-03-08T00:00:00-0500'); // Friday
const march13 = moment('2019-03-13T00:00:00-0400'); // Wednesday
const april5 = moment('2019-04-05T00:00:00-0400');

test('getLastScheduledWeekdays', () => {
  expect(JSON.stringify(getLastScheduledWeekdays(march8, [3, 4]))).toEqual(JSON.stringify([march6, march7]));
});

test('getUpcomingScheduledWeekdays', () => {
  expect(JSON.stringify(getUpcomingScheduledWeekdays(march7, [3, 5]))).toEqual(JSON.stringify([march13, march8]));
});

test('getLastScheduledMonthDays', () => {
  expect(JSON.stringify(getLastScheduledMonthDays(march8, [5, 28])))
    .toEqual(JSON.stringify([march5, feb28]));
});

test('getUpcomingScheduledMonthDays', () => {
  expect(JSON.stringify(getUpcomingScheduledMonthDays(march8, [5, 13])))
    .toEqual(JSON.stringify([april5, march13]));
});

test('getLastScheduledCalendarDates', () => {
  expect(JSON.stringify(getLastScheduledCalendarDates(march8, [
    '2019-02-28',
    '2019-03-07',
    '2019-03-09',
  ]))).toEqual(JSON.stringify([feb28, march7]));
});

test('getUpcomingScheduledCalendarDates', () => {
  expect(JSON.stringify(getUpcomingScheduledCalendarDates(march8, [
    '2019-02-28',
    '2019-03-07',
    '2019-03-13',
  ]))).toEqual(JSON.stringify([march13]));
});
