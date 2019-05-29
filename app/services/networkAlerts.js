import { Alert } from 'react-native';

export const connectionAlert = () => Alert.alert(
  'No Internet Connection',
  'Please connect to the internet',
  [
    {
      text: 'Dismiss',
      style: 'cancel',
    },
  ],
);

export const mobileDataAlert = (toggleMobileDataAllowed) => {
  Alert.alert(
    'No Wi-fi Connection',
    'Please connect to wi-fi or allow cellular data',
    [
      {
        text: 'Dismiss',
        style: 'cancel',
      },
      {
        text: 'Use Cellular Data',
        onPress: toggleMobileDataAllowed,
        style: 'default',
      },
    ],
  );
};
