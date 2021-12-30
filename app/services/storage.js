import AsyncStorage from '@react-native-async-storage/async-storage';
import FilesystemStorage from 'redux-persist-filesystem-storage';
import { Platform } from 'react-native';

const isAndroid = Platform.OS === 'android';

export const storeData = async (storageKey, value) => {
  try {
    const jsonValue = JSON.stringify(value)

    if (isAndroid) {
      await FilesystemStorage.setItem(storageKey, jsonValue);
    } else {
      await AsyncStorage.setItem(storageKey, jsonValue);
    }
  } catch (e) {
    // saving error
    console.log(e)
  }
}

export const getData = async (storageKey, defaultValue=null) => {
  try {
    const jsonValue = isAndroid ? FilesystemStorage.getItem(storageKey) : await AsyncStorage.getItem(storageKey);

    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    // error reading value
    console.log(e)

    return defaultValue;
  }
}

export const clearStorage = () => {
  if (isAndroid) {
    return FilesystemStorage.clear();
  }

  return AsyncStorage.clear();
}
