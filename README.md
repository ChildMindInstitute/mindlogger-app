# MindloggerDevelopment 0.1.2

This mobile app (Android ≥ 5.0 "Lollipop" and iOS ≥ 10.0 "Whitetail") is intended to build apps for collecting data for the Child Mind Institute

[![Bitrise Build Status](https://app.bitrise.io/app/cd8e019aed55b142/status.svg?token=wFJ6Vq6YzRq4Od8HvEbwug&branch=develop)](https://app.bitrise.io/app/68551a54551c4340)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system, or visit https://matter.childmind.org/Mindlogger/demo#mobile-app for instructions to download the demo mobile app.

### Prerequisites

You need to have your own Girder instance running or leave your `apiHost` set to `'https://mindlogger-dev.vasegurt.com/api/v1'` in [`app/config`](https://github.com/ChildMindInstitute/mindlogger-app/blob/develop/app/config.js#L2). Likewise, you'll either need to set up your own filestore or leave `s3_image` set to store in our AWS S3 `"mindloggerimages"` bucket in [`app/config`](https://github.com/ChildMindInstitute/mindlogger-app/blob/develop/app/config.js#L3-L5).

You need [Node ≤10.11.0, npm ≥4.3.0 & ≤6.4.1](https://github.com/creationix/nvm#user-content-usage), [yarn ≥1.3.2](https://yarnpkg.com) and [React Native ≥0.49.3](https://facebook.github.io/react-native/) to be installed.
For example
```
npm -v
4.3.0
yarn -v
1.3.2
react-native -v
react-native: 0.49.3
```
You also need to have [Xcode](https://developer.apple.com/xcode/) and [Android Studio](https://developer.android.com/studio/) to be installed.

### Installing

You need to install packages first.

```
yarn install
```

Link packages with React Native iOS and Android projects

```
react-native link
```

## Deployment

iOS:
```
react-native run-ios
```

Android:
```
react-native run-android
```

## Release build

### Bitrise

Continuous integration: changes to the master branch will be automatically built through [Bitrise](https://app.bitrise.io/app/68551a54551c4340).

### fastlane (iOS)

iOS:

You can use [fastlane](https://fastlane.tools/)
From root directory of repository
```
cd ios
fastlane beta
```
It will archive release build for iOS and push to appstore. It will take several minutes.

### Xcode (iOS)

Otherwise, you can build and archive manually using Xcode.

### yarn (Android)

Android:

```
yarn prod-bundle
yarn prod-build
```
It will create app-release.apk in android/app/build/outputs folder

## Built With

* [React Native](https://facebook.github.io/react-native/docs/getting-started.html) - React Native framework

## Contributing

1. Check [open issues](https://github.com/ChildMindInstitute/mindlogger-app/issues) for known issues and discussions.
2. If your issus is not already listed, add your issue, optionally with :octocat: [gitmoji](https://gitmoji.carloscuesta.me/).
3. Clone this repository.
4. If your issue already has a discussion, see if it has a branch. If so, checkout that branch before creating your own.
5. Create a new branch to work in.
6. When you're ready to submit your changes, [update the version](#versioning) and submit a pull request from your branch to the branch you branched from (ie, the branch you checked out in step 4 above or `master`).
7. One or more of the project developers will review your request and merge or request changes.

## Versioning

Use [Semantic Versioning 2.0.0](https://semver.org/#semantic-versioning-200). Always develop in a feature-specific branch and update the version (at least the patch version, but a higher-level version if appropriate) when submitting a pull request.

To increment a major or minor version, complete the relevant project board. Currently we're working on [v0.1](https://github.com/orgs/ChildMindInstitute/projects/6). [v0.2](https://github.com/orgs/ChildMindInstitute/projects/9) is on deck.

*Note: the following major.minor versions will start with the listed patch versions (due to previous versioning schemes):
  - v0.7.1
  - v0.8.2
  - v0.9.2
  - v1.0.1

For this repository, the version exists in 4 places:
1. [This README](#)
2. [package.json](https://github.com/ChildMindInstitute/mindlogger-app/blob/master/package.json): [`version`](https://github.com/ChildMindInstitute/mindlogger-app/blob/develop/package.json#L3)
3. [mindlogger-app/android/app/build.gradle](https://github.com/ChildMindInstitute/mindlogger-app/blob/develop/android/app/build.gradle)
   1. [`versionName`](https://github.com/ChildMindInstitute/mindlogger-app/blob/develop/android/app/build.gradle#L105)
   2. [`versionCode`](https://github.com/ChildMindInstitute/mindlogger-app/blob/develop/android/app/build.gradle#L104) (integer: start at `1` and increment for dev builds, increment the patch or above and reset `versionCode` to `1` for pull requests)
4. [ios/MDCApp/Info.plist](https://github.com/ChildMindInstitute/mindlogger-app/blob/develop/ios/MDCApp/Info.plist)
   1. [`CFBundleShortVersionString`](https://github.com/ChildMindInstitute/mindlogger-app/blob/develop/ios/MDCApp/Info.plist#L19-L20)
   2. [`CFBundleVersion`](https://github.com/ChildMindInstitute/mindlogger-app/blob/develop/ios/MDCApp/Info.plist#L23-L24) (match to [`versionCode`, above](#versioncode))

## Authors

* [**Erik Ilyin**](https://github.com/erik-ilyin) - *Independent developer*
* [Child Mind Institute **MATTER Lab**](https://matter.childmind.org/mindlogger)

See also the list of [contributors](https://github.com/ChildMindInstitute/ab2cd-app/contributors) who participated in this project.

## License

[Apache 2.0](LICENSE)
