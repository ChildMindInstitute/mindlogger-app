import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { checkIfVersionUpdateExists } from '../../services/network';

const MINIMUM_UPDATEABLE_VERSION_NUMBER = 22;

const checkIfVersionUpdated = (versionString) => {
  const [firstDigit, secondDigit] = versionString.split('.');
  const majorVersionUpdated = Number(firstDigit) > 0;
  const minorVersionUpdated = Number(secondDigit) >= MINIMUM_UPDATEABLE_VERSION_NUMBER;

  return majorVersionUpdated || minorVersionUpdated;
};

const useShouldUpdateApplication = () => {
  const [shouldUpdateApplication, setShouldUpdateApplication] = useState(false);
  const [storeUrl, setStoreUrl] = useState(false);

  const checkIfUpdateAppIsNeeded = async () => {
    try {
      const result = await checkIfVersionUpdateExists();


      const link = Platform.select({ ios: result?.links?.ios, android: result?.links?.android });

      if (!result?.version || !link) return;


      if (!checkIfVersionUpdated(result.version)) return;

      const storeUrlToUpdate = Platform.OS === 'ios' ? result.links.ios : result.links.android;

      setStoreUrl(storeUrlToUpdate);
      setShouldUpdateApplication(true);
    } catch (e) {
      console.warn('[useShouldUpdateApplication]: Error', e);
    }
  };

  useEffect(() => {
    checkIfUpdateAppIsNeeded();
  }, []);

  return { shouldUpdateApplication, storeUrl };
};


export { useShouldUpdateApplication };
