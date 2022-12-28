import moment from 'moment';

const DelayCheckResult = {
    Cancel: 1,
    Postpone: 2,
    ExecuteAndExit: 3,
}

export function withDelayer(fn, { repeatIn = 1000, check }) {
    let timerId;

    const actions = {
        [DelayCheckResult.Cancel]: cancel,
        [DelayCheckResult.Postpone]: repeat,
        [DelayCheckResult.ExecuteAndExit]: fn,
    }

    function repeat(...args) {
        timerId = setTimeout(() => {
            tryToExecute(...args);
        }, repeatIn);
    }

    function tryToExecute(...args) {
        const checkResult = check({ DelayCheckResult });

        actions?.[checkResult](...args);
    }

    function cancel() {
        if (timerId) {
            clearTimeout(timerId);
        }
    }

    return function (...args) {
        tryToExecute(...args)
    }
}

export const getIdBySplit = (sid) => sid.split("/").pop();

export function buildExactDateFromUTC(date) {
    const utcMoment = moment.utc(date);
  
    const year = utcMoment.year();
    const month = utcMoment.month();
    const day = utcMoment.date();
    const hours = utcMoment.hours();
    const minutes = utcMoment.minutes();
  
    return new Date(year, month, day, hours, minutes);
  }
