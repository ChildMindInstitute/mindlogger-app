import { Platform } from 'react-native'

export const canSupportNotifications = Platform.Version < 31;
