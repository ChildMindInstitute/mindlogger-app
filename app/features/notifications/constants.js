import { Platform } from 'react-native'

const ONE_MINUTE = 60000;

const MAX_SCHEDULED_NOTIFICATION_SIZE_ANDROID = 50;
const MAX_SCHEDULED_NOTIFICATIONS_SIZE_IOS = 64;

export const QUEUE_STORAGE_KEY = 'NotificationQueue'
export const ANDROID_DEFAULT_CHANNEL_ID = 'MindLoggerChannelId';

export const SYSTEM_RESCHEDULING_NOTIFICATION_ID = 'system_trigger_for_rescheduling';

export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';

export const SYSTEM_RESERVED_CAPACITY = isIOS ? 1 : 0;

export const MAX_SCHEDULED_NOTIFICATIONS_SIZE =
    (
        isAndroid
            ? MAX_SCHEDULED_NOTIFICATION_SIZE_ANDROID
            : MAX_SCHEDULED_NOTIFICATIONS_SIZE_IOS
    ) - SYSTEM_RESERVED_CAPACITY;

export const SYSTEM_NOTIFICATION_DELAY = ONE_MINUTE * 30;

export const SCENES_TO_NOT_RENDER_NOTIFICATIONS = ['take_act', 'activity_summary', 'activity_thanks', 'activity_flow_submit', 'activity_end'];
