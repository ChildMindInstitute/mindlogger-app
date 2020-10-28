import i18n from 'i18next';
import { Alert } from 'react-native';

export const connectionAlert = () => Alert.alert(
  i18n.t('network_alerts:no_internet_title'),
  i18n.t('network_alerts:no_internet_subtitle'),
  [
    {
      text: i18n.t('network_alerts:no_internet_text'),
      style: 'cancel',
    },
  ],
);

export const mobileDataAlert = (toggleMobileDataAllowed) => {
  Alert.alert(
    i18n.t('network_alerts:cellular_data_title'),
    i18n.t('network_alerts:cellular_data_subtitle'),
    [
      {
        text: i18n.t('network_alerts:cellular_data_text'),
        style: 'cancel',
      },
      {
        text: i18n.t('network_alerts:use_cellular_data'),
        onPress: toggleMobileDataAllowed,
        style: 'default',
      },
    ],
  );
};
