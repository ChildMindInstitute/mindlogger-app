# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.11.32] - 2019-5-3
- Change ```resizeMode``` property of images in widgets to prevent sides from being cut off

## [0.11.31] - 2019-05-01
- Removed outdated lifecycle methods

## [0.11.30] - 2019-4-30
- Removed number above slider
- Fixed questionniare issue

## [0.11.29] - 2019-05-03
- Added getAppletSchedule

## [0.11.28] - 2019-4-28
- Fixd Notification Badge Issue

## [0.11.25] - 2019-04-22
- Fixed double click of activity button
- Removed login log
- Fixed double click of applet button

## [0.11.24] - 2019-04-14
- Hide next button until the user makes a selection on all question type.

## [0.11.23] - 2019-04-08
- Fixed user identity issue after password reset

## [0.11.23] - 2019-04-24
- Fixed NaN issue on slider

## [0.11.22] - 2019-04-02
- Implemented foreground jobs to update activity status

## [0.11.21] - 2019-03-31
- Changed ItemChart + LineChart label positioning

## [0.11.20] - 2019-04-01
- Updated activity every 10 mins
- Changed scroll bar to be discrete on NIMH applet
- Timeout issue is fixed

## [0.11.19] - 2019-03-31
- Updated signup scene + signup form style
- Update fields available for new account
- Remove first name, last name, email fields
- Add display name field
- Remove button to recover password with email
- Improved the performance on NIMH applet

## [0.11.18] - 2019-03-30
- updated request for refreshing applets

## [0.11.17] - 2019-03-29
- Updated sliderbar to be discrete for NIMH applet

## [0.11.16] - 2019-03-26
- Updated activity status automatically every second
- Updated unit tests for sortActivities

## [0.11.15] - 2019-03-25
- Updated getEvents with changed 'users' field

## [0.11.14] - 2019-03-23
- A due by time is shown on the activity button regardless of the state it is in

## [0.11.13] - 2019-03-22
- Fixed loading error on Time picker
- Fixed critical error (division by zero) on slider

## [0.11.12] - 2019-03-19
- Fixed crashes of the app on radio button (multi select)

## [0.11.11] - 2019-03-18
- Added control buttons to slider bar
- Added tick marks and labels to slider bar
- Updated slider styles

## [0.11.10] - 2019-03-16
- Removed asterisk around text on data tab
- Finished individual schedules.
- Updated tests for individual schedules.

## [0.11.9] - 2019-03-12
- Finished activity timeout issue
- Finished general scheduling issue
- Fixed push notification to be taken to the activity's first question.

## [0.11.8] - 2019-03-04
- Shows data on correct day on data tab.

## [0.11.7] - 2019-03-03
- Update Style of See More button above progress bar

## [0.11.6] - 2019-03-02
- Image URLs and markup text are removed from questions

## [0.11.5] - 2019-03-02
- Align Images to center that are above questions

## [0.11.4] - 2019-02-28
- Send timezone to receive notification based on user mobile timezone
- Check where the schema's ```variableMap``` is stored and modify ```variableMapPath``` and ```variableMapAr``` accordingly in ```\app\models\json-ld.js```

## [0.11.3] - 2019-02-24
- Add Monday through Sunday to the X-axis using only the first letter
- Remove questions without answers on Data Tab
- Change question width into 100%
- Change slider bar start location

## [0.11.2] - 2019-02-11
- :lipstick: Update the style of see more button

## [0.11.1] - 2020-02-06
- :sparkles: :zap: :bug: Introduced new push notification feature with firebase
- :bug: Fix issues of push notifcation feature

## [0.11.0] - 2020-02-05
- :arrow_up: upgrade react native version @0.61.5

## [0.10.4] - 2019-01-29
- :bug: Fix slider issues at the left.
- :bug: Fix slider widget to be compliant
- :design: Update slider knob
- :lipstick: Remove number above slider

## [0.10.3] - 2019-01-29
### Fixed
- :bug: Fix displaying the history of questions/answers in data tab

## [0.10.2] - 2019-01-28
### Fixed
- :lipstick: Prevent Text overflows onto checkboxes and radio buttons

## [10.0.1] - 2019-01-28
- Add See More Button when it overflows the page

## [0.9.19] - 2019-01-21
- Add custom method in ```visibility.js``` to compute multi-select conditional visibility logic
- Fix regex in ```visibility.js``` to replace all occurrences of matches

## [0.9.16] - 2019-01-16
- :lipstick: Redesign Progress Bar

## [0.9.15] - 2020-01-10
### Change behavior
- When the user selects Okay on a DatePicker it progresses him to the next question

## [0.9.14] - 2019-01-10
- :bug: Fix Resume action to take the user back to the last question he or she did not answer

## [0.9.16] - 2020-01-17
- :recycle: Cross platform refactor for Select Component without Modal

## [0.9.13] - 2019-01-08
- :bug: Fix DatePickerIOS doesn't show on Dark Mode for iOS 13.3

## [0.9.12] - 2020-01-07
### Added
- :sparkles: Addig flag to request Lock Screen Notifications for Push Notifications

## [0.9.10]‒[0.9.11] - 2019-12-17
- :lipstick: Fix font size scaling from device's settings
- :lipstick: Change radio and checkbox buttons appearance
- :ambulance: Add applets filtering to prevent rendering issue
- Add TimePicker to the Widget's condition

## [0.9.9]‒[0.9.10] - 2019-12-17
- :lipstick: More invasive notifications

## [0.9.8] - 2019-12-10
### Fixed
- :ambulance: Don't crash if responseDates is undefined

## [0.9.7] - 2019-12-10
### Updated
- :arrow_up: react-native-webview@5→7
- :arrow_up: :apple: libRNLocalize
## [0.9.5]‒[0.9.6] - 2019-12-10
## Updated
- :rocket: :robot: Google Play API @v3.0
- :rocket: :robot: Google Play Mobile Vision @19.0.0
- :rocket: Other Bitrise steps

## [0.9.4] - 2019-11-26
### Changed
- Update slider bar (horizontal only)

## [0.9.3] - 2019-11-26
### Changed
- Remove due date from activity list

## [0.9.2] - 2019-11-21
### Fixed
- Sorting of activities

## [0.9.1] - 2019-11-20
### Fixed
- Scheduling of activities

## [0.8.10] - 2019-11-13
### Updated
- :lock: :apple: :books: User privacy descriptions

## [0.8.8] - 2019-11-12
### Fixed
- Schema handling for HBN EMA

## [0.8.7] - 2019-11-08
### Upgraded
- :rocket: :apple: Bitrise Deploy to iTunes Connect - Application Loader@0.10.1

## [0.8.6] - 2019-11-08
### Upgraded
- :rocket: :robot: Google Play API@28

## [0.8.5] - 2019-11-01
### Update
- Schema keyword prefixes

## [0.8.4] - 2019-10-30
### Fixed
- React Native Debugger crash

## [0.8.3] - 2019-10-02
### Fixed
- Dots on current day iff responses on current day

## [0.8.2] - 2019-09-27
### Fixed
- React Native version conflicts

## [0.8.1] - 2019-09-26
### Added
- Plots!

## [0.7.1] - 2019-09-25
### Upgraded
- React Native @0.59.9

## [0.6.3] - 2019-09-23
### Fixed
- Local notifications on Android and iOS

## [0.6.2] - 2019-09-17
### Added
- Activity preamble handling

## [0.6.1] - 2019-09-16
### Updated
- Resolution of React Native extensions by eslint.
- Setup and development instructions in README.
- Yarn aliases to run React Native Bundler, deploy to Android and iOS, and run the linter.

## [0.5.16] - 2019-09-04
### Changed
- :robot: Footer tab color

## [0.5.15] - 2019.09-03
### Added
- Delete functionality

## [0.5.14] - 2019-08-26
### Fixed
- :robot: Android build

### Changed
- :lock: Security upgrades

## [0.5.13] - 2019-08-22‒26
### Added
- [Red dot badges](https://www.nytimes.com/2018/02/27/magazine/red-dots-badge-phones-notification.html)
  - Home button (new invitation)
  - On new invitation

## [0.5.12] - 2019-08-22
### Changed
- If an applet is removed, and that applet is the user's current applet, then this takes the user to the home screen instead of the current applet

## [0.5.11] - 2019-08-21
### Changed
- Scroll no longer yo-yos

## [0.5.10] - 2019-08-20‒21
### Changed
- :lock: Security upgrades

## [0.5.9] - 2019-08-20‒21
### Changed
- Icon

## [0.5.8] - 2019-08-19‒20
### Added
- Settings gear

### Changed
- Default view
- About tab
- Data tab
- Thanks page
- Centered and made questions larger in the screens
- :apple: Font

### Removed
- Drawer
- Some branding

## [0.5.6] - 2019-08-09
### Added
- Increased SVG support

## [0.5.5] - 2019-08-07
### Changed
- Notifications go to activity instead of menu

## [0.5.1‒0.5.4] - 2019-06-27‒28
### Added
- Animations

## [0.4.1‒0.4.3] - 2019-06-26‒27
### Changed
- Restored basic notifications

## [0.3.4‒0.3.6] - 2019-06-25‒26
### Changed
- Update slider bar (horizontal only)

## [0.3.1‒0.3.3; 0.3.7‒0.3.9; 0.5.4] - 2019-06-20; 2019-06-25‒27; 2019-06-19
### Changed
- Bug fix for Android build

## [0.3.0] - 2019-06-14
### Changed
- Android and iOS versions now locked in sync.

## [0.2.12] - 2019-06-14
### Added
- :robot: :arrow_up: 64-bit support for Android

## [0.2.11] - 2019-06-13
### Changed
- Offline media loading behavior

## [0.2.10] - 2019-06-12
### Changed
- https://api.mindlogger.info → https://api.mindlogger.org
- v0.1 deprecated

## [0.2.9] - 2019-06-11
### Added
- Geolocation widget

### Changed
- Only renders screens in view
- :robot: :lipstick: Removes white header on activity screens

## [0.2.8] - 2019-06-06
### Added
- Screen control at item or activity level
  - skip
  - full screen
  - auto advance

### Changed
- Default if no value is set for an item
- Fixes some small issues with the Camera widget

## [0.2.7] - 2019-06-04
### Added
- Camera widget (restored)
- Table widget (restored)
  - counter
  - text entry

### Changed
- audio: split stimulus and record into separate widgets
- Details page now requires a click to get to rather than to get through

## [0.2.6] - 2019-05-28
### Added
- Mobile data usage settings

### Changed
- Settings screen

## [0.2.5] - 2019-05-24
### Added
- Conditional logic

### Changed
- Improved audio recording

## [0.2.4] - 2019-05-21
### Added
- Skinning
- Usage descriptions
- Large icon

### Changed
- App Store Large Icon Missing
- iOS linking
- QR scanning
- Allow empty "About"
- Less explicit colors

### Removed
- Global S3

## [0.2.3] - 2019-05-20
### Added
- Links to demo applets
- Status bar

### Changed
- Android footer

## [0.2.2] - 2019-05-17
### Upgraded
- React Native @0.59.8

## [0.2.1] - 2019-04-22
### Added
- QR scanner functionality for changing endpoint URI prefix.

## [0.2.0] - 2019-04-18
### Changed
- Moving from ad hoc schema to [ReproNim/schema-standardization](https://github.com/ReproNim/schema-standardization).

## [0.1.4](https://github.com/ChildMindInstitute/mindlogger-app/tree/58112c9207016aef92d1e6514c0133758b9e54d4) - 2019-03-04
### Changed
- Numerous UX bug fixes

## [0.1.0](https://github.com/ChildMindInstitute/mindlogger-app/releases/tag/v0.1.0) - 2018-10-23
### Initial Release
- UX testing in [Healthy Brain Network](http://www.healthybrainnetwork.org/)
