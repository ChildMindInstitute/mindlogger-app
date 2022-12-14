import { Platform } from 'react-native'

export const canSupportNotifications = Platform.OS === 'ios' || Platform.Version < 31;
