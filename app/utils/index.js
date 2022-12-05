export function withDelayer(fn, { repeatIn = 1000, canExecute }) {
    let timerId;

    function repeat(...args) {
        timerId = setTimeout(() => {
            tryToExecute(...args);
        }, repeatIn);
    }

    function tryToExecute(...args) {
        if (canExecute(cancel)) {
            fn(...args);
        } else {
            repeat(...args);
        }
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
