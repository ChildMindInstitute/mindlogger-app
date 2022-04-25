# MindLogger 0.19.22

_Note: v0.1 is deprecated as of June 12, 2019._

This mobile app (Android ≥ 5.0 "Lollipop" and iOS ≥ 10.0 "Whitetail") is intended to build apps for collecting data.

[![Bitrise Build Status](https://app.bitrise.io/app/cd8e019aed55b142.svg?token=wFJ6Vq6YzRq4Od8HvEbwug)](https://app.bitrise.io/app/cd8e019aed55b142)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system, or visit https://mindlogger.org for instructions to download the demo mobile app.

### Widget development

[See the widget development guide](https://github.com/ChildMindInstitute/mindlogger-app/blob/master/widget-development.md)

### Prerequisites

You need to have your own Girder instance running or leave your `defaultApiHost` set to `'https://api.mindlogger.org/api/v1'` in [`app/config.js`](https://github.com/ChildMindInstitute/mindlogger-app/blob/master/app/config.js#L2).

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

## Development

iOS:

```
yarn ios
```

Android:

```
yarn android
```

### Testing

You can run unit tests locally.

```
yarn test
```

You can also run eslint on the entire codebase.

```
yarn lint
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

- [React Native](https://facebook.github.io/react-native/docs/getting-started.html) - React Native framework

## Contributing

See [:link: CONTRIBUTING](./CONTRIBUTING.md).

## Versioning

See [:link: CONTRIBUTING#Versioning](./CONTRIBUTING.md#Versioning).

## Deployment

See [:link: CONTRIBUTING#Deployment](./CONTRIBUTING.md#Deployment).

## Authors

- [Child Mind Institute **MATTER Lab**](https://matter.childmind.org/mindlogger) list of [contributors](https://github.com/ChildMindInstitute/ab2cd-app/contributors)
- Early contributors:
  - [**Stuart Freen**](https://github.com/stufreen) - _Rangle.io developer: code refactoring, pilot version_
  - [**Erik Ilyin**](https://github.com/erik-ilyin) - _Independent developer: initial prototype_


## License

CPAL 1.0
