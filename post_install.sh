#!/usr/bin/env bash
# fail if any commands fails
set -e
# debug log
set -x

# :apple: iOS
if [ ! -d "node_modules/react-native/third-party" ]; then
  cd node_modules/react-native ; ./scripts/ios-install-third-party.sh ; cd ../../
  cd node_modules/react-native/third-party/glog-0.3.5/ ; ./../../scripts/ios-configure-glog.sh ; cd ../../../../
fi

# :robot: Android
rm -rf node_modules/react-native-push-notification/.git
yarn add --dev jetifier
npx jetify
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
