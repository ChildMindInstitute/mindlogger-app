import {
  AppRegistry,
} from 'react-native';
import setup from './app/setup';
import * as Sentry from '@sentry/react-native';


if (!__DEV__) {
  Sentry.init({
    dsn: 'https://9bd31f61c40541cfb0057e85e09b2cda@o414302.ingest.sentry.io/5313182',
  });
}

AppRegistry.registerComponent('MDCApp', setup);
