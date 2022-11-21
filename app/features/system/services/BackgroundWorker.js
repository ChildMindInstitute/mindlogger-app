import BackgroundFetch from "react-native-background-fetch";

import { MINIMUM_ALLOWED_BG_TASK_INTERVAL_MINUTES } from '../constants'

function BackgroundWorker() {
    function setTask(callback, options = {}) {
        if (typeof callback !== 'function') throw Error('[BackgroundWorker] Callback must be a function');

        const { intervalInMinutes } = options;

        function onTimeout(taskId) {
            console.log("[BackgroundFetch] Failed to start background task");
            BackgroundFetch.finish(taskId);
        }

        BackgroundFetch.configure({
            minimumFetchInterval: intervalInMinutes ?? MINIMUM_ALLOWED_BG_TASK_INTERVAL_MINUTES,
            stopOnTerminate: false,
            startOnBoot: true,
            enableHeadless: true,
          },
          async (taskId) => {
            console.log("[BackgroundWorker] Background job started running");
            await Promise.resolve(callback());
            console.log("[BackgroundWorker] Background job finished");

            BackgroundFetch.finish(taskId);
          }, onTimeout);
    }

    function setAndroidHeadlessTask(callback) {
        if (typeof callback !== 'function') throw Error('[BackgroundWorker: android] Callback must be a function');

        async function headlessTask(event) {
            console.log("[BackgroundWorker] Background headless job started running");

            const { taskId, timeout } = event;

            if (timeout) {
                BackgroundFetch.finish(taskId);
                return;
            }

            await Promise.resolve(callback());

            console.log("[BackgroundWorker] Background headless job finished");
            BackgroundFetch.finish(taskId);
        }

        BackgroundFetch.registerHeadlessTask(headlessTask);
    }

    return {
        setTask,
        setAndroidHeadlessTask
    }
}


export default BackgroundWorker();
