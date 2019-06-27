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
rm -rf node_modules/react-native-push-notifications/.git
npm install --save-dev jetifier
npx jetify
