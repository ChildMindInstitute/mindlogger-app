import { QUEUE_STORAGE_KEY } from '../constants'

function NotificationQueue(storage) {
    if (!storage) throw Error('[NotificationQueue] Storage service is required.')
    if (!storage.getItem || !storage.setItem) throw Error('[NotificationQueue] Storage service misses required methods.')

    async function get() {
        const queue = await Promise.resolve(storage.getItem(QUEUE_STORAGE_KEY));

        return queue ? JSON.parse(queue) : [];
    }

    function set(value) {
        return Promise.resolve(storage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(value)));
    }

    function clear() {
        return set('');
    }
    
    return {
        get,
        set,
        clear,
    }
}

export default NotificationQueue;
