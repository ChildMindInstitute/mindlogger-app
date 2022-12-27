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
