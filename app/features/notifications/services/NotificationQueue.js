import { QUEUE_STORAGE_KEY } from '../constants'

function NotificationQueue(storage) {
    if (!storage) throw Error('[NotificationQueue] Storage service is required.')
    if (!storage.getItem || !storage.setItem) throw Error('[NotificationQueue] Storage service misses required methods.')

    async function get() {
        const queue = await Promise.resolve(storage.getItem(QUEUE_STORAGE_KEY));

        return queue ?? [];
    }

    function set(value) {
        if (!Array.isArray(value)) throw Error('[NotificationQueue] Wrong array provided')

        return Promise.resolve(storage.setItem(QUEUE_STORAGE_KEY, value));
    }
    
    return {
        get,
        set,
    }
}

export default NotificationQueue;
