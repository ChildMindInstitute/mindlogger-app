import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

const MINIMUM_UPDATEABLE_VERSION_NUMBER = 22;

const fetchUpdateInformation = async () => {
  const mockResponse = {
    version: '0.22.0',
    links: {
      ios: 'https://apps.apple.com/jm/app/mindlogger-pilot/id1301092229',
      android: 'https://play.google.com/store/apps/details?id=com.childmindinstitute.exposuretherapy',
    },
  };

  return new Promise((resolve) => {
    setTimeout(() => {
      return resolve(mockResponse);
    }, 3000);
  });
};


const checkIfVersionIsUpdateable = (versionString) => {
  const [firstDigit, secondDigit] = versionString.split('.');
  if (Number(firstDigit) > 0) {
    return true;
  }
  if (Number(secondDigit) >= MINIMUM_UPDATEABLE_VERSION_NUMBER) {
    return true;
  }
  return false;
};

const useShouldUpdateApplication = () => {
  const [shouldUpdateApplication, setShouldUpdateApplication] = useState(false);
  const [storeUrl, setStoreUrl] = useState(false);

  const checkIfUpdateAppIsNeeded = async () => {
    try {
      const result = await fetchUpdateInformation();
      if (
        !result?.version?.length
            || !result?.links?.ios?.length
            || !result?.links?.android?.length
      ) {
        return null;
      }

      if (!checkIfVersionIsUpdateable(result.version)) return null;

      const storeUrlToUpdate = Platform.OS === 'ios' ? result.links.ios : result.links.android;

      setStoreUrl(storeUrlToUpdate);
      setShouldUpdateApplication(true);
      return null;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    checkIfUpdateAppIsNeeded();
  }, []);

  return { shouldUpdateApplication, storeUrl };
};


export { useShouldUpdateApplication };
