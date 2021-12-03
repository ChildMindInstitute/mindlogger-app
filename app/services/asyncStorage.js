import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeData = async (storageKey, value) => {
  try {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem(storageKey, jsonValue)
  } catch (e) {
    // saving error
    console.log(e)
  }
}

export const getData = async (storageKey, defaultValue=null) => {
  try {
    const jsonValue = await AsyncStorage.getItem(storageKey)
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    // error reading value
    console.log(e)

    return defaultValue
  }
}

export const clearAsyncStorage = () => {
  return AsyncStorage.clear();
}