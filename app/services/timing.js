import i18n from 'i18next';
/**
 *  Object that keeps a registry of all running timers.
 *
 *  @type {object}
 */
const IDENTIFIERS = {};

/**
 * Counter for the timer ID sequence.
 *
 * @type {number}
 */
let COUNTER = 0;

/**
 * Returns the next ID in the sequence.
 *
 * @returns {number} the next ID in the sequence.
 */
function _nextId() {
  return ++COUNTER;
}

/**
 * Stops a timer by its ID.
 *
 * @returns {void}
 */
export function clearExec(timerId) {
  clearInterval(IDENTIFIERS[timerId]);
  delete IDENTIFIERS[timerId];
}

/**
 * Executes the given function after the given time.
 *
 * @example <caption>Clock that prints the time every second</caption>
 *
 * delayedExec(() => {
 *   const now = new Date();
 *   console.log(now.toTimeString());
 * }, { every: 1000 });
 *
 * @example <caption>Run a function after five seconds</caption>
 *
 * delayedExec(fn, { after: 5000 });
 *
 * @param {function} fn the function to be executed after the timer is done.
 * @param {object} options object with options for the timef.
 * @param {number} [options.after] the number of ms to wait before executing.
 * @param {number} [options.every] the number of ms between executions.
 *
 * @returns {number} the ID for the new timer.
 */
export function delayedExec(fn, options) {
  if (!('after' in options) && !('every' in options)) {
    throw new Exception(i18n.t('timing:provide_option'));
  }

  if ('after' in options && Number.isNaN(options.after)) {
    throw new Exception(i18n.t('timing:to_be_number'));
  }

  if ('every' in options && Number.isNaN(options.every)) {
    throw new Exception(i18n.t('timing:every_number'));
  }

  /**
   * Date on which the function should run.
   * @type {Date}
   */
  const dueDate = new Date();

  dueDate.setTime(dueDate.getTime() + (options.after || options.every));

  /**
   * Unique identifier for this timeout/interval.
   * @type {number}
   */
  const timerId = _nextId();

  // Run each second and check if the function should run.
  IDENTIFIERS[timerId] = setInterval(
    () => {
      /**
       * Current time.
       * @type {Date}
       */
      const now = new Date();

      if (IDENTIFIERS[timerId] === undefined) {
        // Timer was cleared. Skip.
        return;
      }

      if (now < dueDate) {
        // Due date not reached yet. Keep waiting.
        return;
      }

      // Due date reached. Execute.
      fn();

      if ('after' in options) {
        // Timeout is one time only. Clear the timeout.
        clearExec(timerId);
      } else {
        // Interval has to repeat, calculate next execution time.
        dueDate.setTime(now.getTime() + options.every);
      }
    },
    300, // One second.
  );

  return timerId;
}
