const INTERVAL = 'interval';
const TIMEOUT = 'timeout';

/**
 *  Object that keeps a registry of all running timeouts and intervals.
 *
 *  @type {object}
 *  @param {object} timeout object where each property is a timeout id.
 *  @param {object} interval object where each property is a interval id. 
 */
const IDENTIFIERS = {
  timeout: {},
  interval: {},
};

/**
 * Object that keeps a counter for each timing function: intervals and timouts.
 *
 * @type {object}
 * @param {number} timeout The current timeout counter.
 * @param {number} interval The current interval counter.
 */
const COUNTERS = {
  timeout: 0,
  interval: 0,
};


/**
 * Returns the next ID in the sequence for the given timer type.
 *
 * @param {string} timerType either 'interval' or 'timeout'
 *
 * @returns {number} the next ID in the sequence for the given timer type.
 */
function _nextId(timerType) {
  COUNTERS[timerType] += 1;
  return COUNTERS[timerType];
}


/**
 * Stops a timer by its ID.
 *
 * @param {string} timerType either 'interval' or 'timeout'
 *
 * @returns {void}
 */
function _clear(timerType, timerId) {
  clearInterval(IDENTIFIERS[timerType][timerId]);
  delete IDENTIFIERS[timerType][timerId];
}


/**
 * Sets a timer of the given type.
 *
 * When the time has elapsed, the given function will be executed. Unless the
 * timer is cleared before that happens.
 *
 * @param {string}   timerType either 'interval' or 'timeout'.
 * @param {function} fn the function to be executed after the timer is done.
 * @param {number}   time number of milliseconds for the timer.
 *
 * @returns {number} the ID for the new timer.
 */
function _set(timerType, fn, time) {
  /**
   * Date on which the function should run.
   * @type {Date}
   */
  const dueDate = new Date();

  /**
   * Unique identifier for this timeout/interval.
   * @type {number}
   */
  const timerId = _nextId(timerType);

  dueDate.setTime(dueDate.getTime() + time);

  // Run each second and check if the function should run.
  IDENTIFIERS[timerType][timerId] = setInterval(
    () => {
      /**
       * Current time.
       * @type {Date}
       */
      const now = new Date();

      if (IDENTIFIERS[timerType][timerId] === undefined) {
        // Timer was cleared. Skip.
        return;
      }

      if (now < dueDate) {
        // Due date not reached yet. Keep waiting.
        return;
      }

      // Due date reached. Execute.
      fn();

      if (timerType === TIMEOUT) {
        // Timeout is one time only. Clear the timeout.
        _clear(timerType, timerId);
      }
    },
    1000,  // One second.
  );

  return timerId;
}


/**
 * Identical to Javascript's setTimeout but it works on Android.
 *
 * @param {function} fn the callback function.
 * @param {number} time the number of miliseconds to wait.
 *
 * @returns {number} the timeout ID.
 */
export function setTimeout(fn, time) {
  return _set(TIMEOUT, fn, time);
}

/**
 * Identical to Javascript's setInterval but it works on Android.
 *
 * @param {function} fn the callback function.
 * @param {number} time the number of miliseconds to wait.
 *
 * @returns {number} the interval ID.
 */
export function setInterval(fn, time) {
  return _set(INTERVAL, fn, time);
}

/**
 * Removes the timeout.
 *
 * @param {number} id the id of the timeout to be cleared.
 *
 * @returns {void}
 */
export function clearTimeout(id) {
  _clear(TIMEOUT, id);
}

/**
 * Removes the interval.
 *
 * @param {number} id the id of the interval to be cleared.
 *
 * @returns {void}
 */
export function clearInterval(id) {
  _clear(INTERVAL, id);
}
