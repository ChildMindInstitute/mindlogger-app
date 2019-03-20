import moment from 'moment';
import {
  getNextAndLastTimes,
} from './time';

const march7 = moment('2019-03-07T00:00:00-0500'); // Thursday

const march4_9am = moment('2019-03-04T09:00:00-0500'); // Monday
const march4_2pm = moment('2019-03-04T14:00:00-0500');

const march8_9am = moment('2019-03-08T09:00:00-0500'); // Friday
const march8_10am = moment('2019-03-08T10:00:00-0500');

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
