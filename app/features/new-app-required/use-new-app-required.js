import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { checkIfVersionUpdateExists } from '../../services/network';

const MINIMUM_UPDATEABLE_VERSION_NUMBER = 22;

const checkIfVersionUpdated = (versionString) => {
  const [firstDigit, secondDigit] = versionString.split('.');
  const majorVersionUpdated = Number(firstDigit) > 0;
  const minorVersionUpdated = Number(secondDigit) >= MINIMUM_UPDATEABLE_VERSION_NUMBER;

  return majorVersionUpdated || minorVersionUpdated;
};

const useShouldUpdateApplication = (userInfoStorage) => {
  const [shouldUpdateApplication, setShouldUpdateApplication] = useState(false);
  const [storeUrl, setStoreUrl] = useState(false);
  const netInfo = useNetInfo();

  const checkIfUpdateAppIsNeeded = async () => {
    const appUpdateInformation = await userInfoStorage.getAppUpdateInformation();
    if (appUpdateInformation?.storeUrl) {
      setStoreUrl(appUpdateInformation.storeUrl);
      setShouldUpdateApplication(appUpdateInformation.shouldUpdateApplication);
      return;
    }

    try {
      const result = await checkIfVersionUpdateExists();


      const link = Platform.select({ ios: result?.links?.ios, android: result?.links?.android });

      if (!result?.version || !link) return;


      if (!checkIfVersionUpdated(result.version)) return;

      const storeUrlToUpdate = Platform.OS === 'ios' ? result.links.ios : result.links.android;

      setStoreUrl(storeUrlToUpdate);
      setShouldUpdateApplication(true);
      userInfoStorage.setAppUpdateInformation({
        shouldUpdateApplication: true,
        storeUrl: storeUrlToUpdate,
      });
    } catch (e) {
      console.warn('[useShouldUpdateApplication]: Error', e);
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkIfUpdateAppIsNeeded();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    checkIfUpdateAppIsNeeded();
  }, [netInfo.isConnected]);

  return { shouldUpdateApplication, storeUrl };
};


export { useShouldUpdateApplication };
