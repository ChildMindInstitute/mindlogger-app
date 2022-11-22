import './shim.js'

import {
  AppRegistry,
} from 'react-native';
import * as Sentry from '@sentry/react-native';

import setup from './app/setup';
import runBackgroundProcess from './app/runBackgroundProcess'

// if (!__DEV__) {
//   Sentry.init({
//     dsn: 'https://9bd31f61c40541cfb0057e85e09b2cda@o414302.ingest.sentry.io/5313182',
//   });
// }

runBackgroundProcess();

AppRegistry.registerComponent('MDCApp', setup);
