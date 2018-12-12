#!/usr/bin/env bash
# fail if any commands fails
set -e
# debug log
set -x

# write your script here

# or run a script from your repository, like:
if [ ! -d "node_modules/react-native/third-party" ]; then
  cd node_modules/react-native ; ./scripts/ios-install-third-party.sh ; cd ../../
  # cd node_modules/react-native/third-party/glog-0.3.4/ ; ./configure ; cd ../../../../
  cd node_modules/react-native/third-party/glog-0.3.4/ ; sh ../../scripts/ios-configure-glog.sh ; cd ../../../../
fi