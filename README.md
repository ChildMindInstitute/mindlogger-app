# AB2CD - App Builder to Collect Data

App is intended to build apps for collecting data for Child Mind Institute

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

You need to have backend server running.
You need npm, yarn and react-native to be installed.
For example
```
npm -v
4.3.0
yarn -v
1.3.2
react-native -v
react-native: 0.49.3
```
You also need to have Xcode and Android Studio to be installed.

### Installing

You need to install packages first

```
yarn install
```

And link packages with react-native ios and android project

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

iOS:

You can use fastlane
From root directory of repository
```
cd ios
fastlane beta
```
It will archeive release build for iOS and push to appstore. It will take several minutes and 

Otherwise, you can do it manually using Xcode. For more info, check Xcode reference.
Android:

```
yarn prod-bundle
yarn prod-build
```
It will create app-release.apk in android/app/build/outputs folder

## Built With

* [React Native](https://facebook.github.io/react-native/docs/getting-started.html) - React Native framework

## Contributing

## Versioning

## Authors

* **Erik Ilyin** - *Indendent developer* - [Erik](https://github.com/erik-ilyin)

See also the list of [contributors](https://github.com/ChildMindInstitute/ab2cd-app/contributors) who participated in this project.

## License

## Acknowledgments

* etc