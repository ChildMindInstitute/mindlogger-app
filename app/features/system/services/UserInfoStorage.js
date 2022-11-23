import { USER_INFO_STORAGE_KEY } from '../constants'

function UserInfoStorage(storage) {
    if (!storage) throw Error('[UserInfoStorage] Storage service is required.')
    if (!storage.getItem || !storage.setItem || !storage.removeItem) throw Error('[UserInfoStorage] Storage service misses required methods.')

    async function get() {
        const useInfo = await Promise.resolve(storage.getItem(USER_INFO_STORAGE_KEY));

        return useInfo ? JSON.parse(useInfo) : {};
    }

    function set(value) {
        if (!(value)) throw Error('[UserInfoStorage] value is required');

        return Promise.resolve(storage.setItem(USER_INFO_STORAGE_KEY, JSON.stringify(value)));
    }

    async function getUserEmail() {
        const useInfo = await get();

        return useInfo?.email;
    }

    async function getFCMToken() {
        const useInfo = await get();

        return useInfo?.fcmToken;
    }

    async function setKey(key, value) {
        if (!key) throw Error(`[UserInfoStorage] ${key} is required`)
        if (!value) throw Error(`[UserInfoStorage] value for ${key} was not provided`)

        const useInfo = (await get()) ?? {};

        useInfo[key] = value;

        set(useInfo);
    }

    async function setFCMToken(token) {
        return setKey('fcmToken', token);
    }

    async function setUserEmail(email) {
        return setKey('email', email);
    }

    async function clear() {
        await storage.removeItem(USER_INFO_STORAGE_KEY);
    }

    return {
        get,
        set,
        clear,

        getUserEmail,
        setUserEmail,

        getFCMToken,
        setFCMToken,
    }
}

export default UserInfoStorage;
