# Contributing

1. Check the [open issues for this repository](https://github.com/ChildMindInstitute/mindlogger-app/issues), [open bug reports](https://github.com/ChildMindInstitute/MindLogger-bug-reports/issues), and [the overall project 看板](https://github.com/orgs/ChildMindInstitute/projects/9) for known issues and discussions.
2. If your issue is not already listed, add your issue, optionally with :octocat: [gitmoji](https://gitmoji.carloscuesta.me/).
3. Clone this repository.
4. If your issue already has a discussion, see if it has a branch. If so, checkout that branch before creating your own.
5. Create a new branch to work in.
6. When you're ready to submit your changes, [update the version](#versioning) and submit a pull request from your branch to the branch you branched from (ie, the branch you checked out in step 4 above or `master`).
7. One or more of the project developers will review your request and merge or request changes.

## Versioning

Use [Semantic Versioning 2.0.0](https://semver.org/#semantic-versioning-200). Always develop in a feature-specific branch and update the version (at least the patch version, but a higher-level version if appropriate) when submitting a pull request.

To increment a major or minor version, complete the relevant project board. Currently we're working on [v0.1](https://github.com/orgs/ChildMindInstitute/projects/6). [v0.2](https://github.com/orgs/ChildMindInstitute/projects/9) is on deck.

For this repository, the version exists in 4 places:
1. [README](./README.md)
2. [package.json](https://github.com/ChildMindInstitute/mindlogger-app/blob/master/package.json): [`version`](https://github.com/ChildMindInstitute/mindlogger-app/blob/master/package.json#L3)
3. [mindlogger-app/android/app/build.gradle](https://github.com/ChildMindInstitute/mindlogger-app/blob/e0903c84ca6ad94b0b942bd8aaa79c3d31ba04a6/android/app/build.gradle)
   1. [`versionName`](https://github.com/ChildMindInstitute/mindlogger-app/blob/e0903c84ca6ad94b0b942bd8aaa79c3d31ba04a6/android/app/build.gradle#L105)
   2. [`versionCode`](https://github.com/ChildMindInstitute/mindlogger-app/blob/e0903c84ca6ad94b0b942bd8aaa79c3d31ba04a6/android/app/build.gradle#L104) (integer: increment from previous build regardless of the rest of the version numbering)
4. [ios/MDCApp/Info.plist](https://github.com/ChildMindInstitute/mindlogger-app/blob/master/ios/MDCApp/Info.plist)
   1. [`CFBundleShortVersionString`](https://github.com/ChildMindInstitute/mindlogger-app/blob/26bb15b5836aae44df2cde04bf93a018cccfff04/ios/MDCApp/Info.plist#L19-L20)
   2. [`CFBundleVersion`](https://github.com/ChildMindInstitute/mindlogger-app/blob/26bb15b5836aae44df2cde04bf93a018cccfff04/ios/MDCApp/Info.plist#L23-L24) (match to [`versionCode`, above](#versioncode))

## Pull requests

Each pull request (PR) requires a review from at least one contributor other than the author of that PR.

### Submitting a PR
1. In your branch, [update the version in all 4 necessary places](#Versioning).
2. Update [the CHANGELOG](./CHANGELOG.md) with a brief description of the changes in this new version.
3. From your branch, open a pull request to [`master`](https://github.com/ChildMindInstitute/mindlogger-app/tree/master).
4. Give your PR a descriptive title, optionally with :octocat: [gitmoji](https://gitmoji.carloscuesta.me/).
5. Give a brief but thorough description of what your PR does.
6. Submit. [Bitrise](https://app.bitrise.io/app/cd8e019aed55b142) will run :microscope: tests.
7. Wait for a review.
8. Respond to the review if necessary.

## Reviewing a PR
1. Review the description.
2. Test the branch and verify that the changes work as expected.
3. Verify that the [version](#Versioning) and [CHANGELOG](./CHANGELOG.md) have been adequately updated.
4. If any changes are necessary, request those changes.
5. Otherwise, or once the necessary changes are made, approve the PR.
6. Merge the PR (usually via a merge commit, but by a merge squash or a merge rebase by discretion).

## Deployment
1. Once a PR has been merged, create and push a new tag to match the [SemVer](#Versioning).
2. :rocket: [Bitrise](https://app.bitrise.io/app/cd8e019aed55b142) will build and deploy to α testers at both :apple: Apple and :robot: Google.
3. Once α testers test this version, if this version will be released to β testers or more broadly,
    1. Add release notes to the tag.
    2. A user with access to [MindLogger on :robot: Google Play Console](https://play.google.com/apps/publish/#AppDashboardPlace:p=lab.childmindinstitute.data&appid=4974217220385039400) needs to go to ![Release management](https://raw.githubusercontent.com/wiki/ChildMindInstitute/mindlogger-app/images/Google-Play-Console/release-management.png) ▶ ![App releases](https://raw.githubusercontent.com/wiki/ChildMindInstitute/mindlogger-app/images/Google-Play-Console/app-releases.png) ▶ ![Closed track](https://raw.githubusercontent.com/wiki/ChildMindInstitute/mindlogger-app/images/Google-Play-Console/closed-track.png) ▶ ![Alpha](https://raw.githubusercontent.com/wiki/ChildMindInstitute/mindlogger-app/images/Google-Play-Console/alpha.png) ▶ ![MANAGE](https://raw.githubusercontent.com/wiki/ChildMindInstitute/mindlogger-app/images/Google-Play-Console/manage.png) and click ![RELEASE TO BETA](https://raw.githubusercontent.com/wiki/ChildMindInstitute/mindlogger-app/images/Google-Play-Console/release-to-beta.png). On the "New release to beta (Promoting from …)" page,
        1. Fill in ![What's new in this release?](https://raw.githubusercontent.com/wiki/ChildMindInstitute/mindlogger-app/images/Google-Play-Console/whats-new-in-this-release.png), informed by the release notes and CHANGELOG. If not much time has passed since the previous release, the `COPY FROM PREVIOUS RELEASE` button is useful to prefill those notes.
        2. Click ![Review](https://raw.githubusercontent.com/wiki/ChildMindInstitute/mindlogger-app/images/Google-Play-Console/review.png).
        3. Review that the release looks correct, then click ![START ROLLOUT TO BETA](https://raw.githubusercontent.com/wiki/ChildMindInstitute/mindlogger-app/images/Google-Play-Console/start-rollout-to-beta.png).
    3. A user with access to [MindLogger on :apple: App Store Connect](https://appstoreconnect.apple.com/WebObjects/iTunesConnect.woa/ra/ng/app/1299242097) needs to go to ![TestFlight](https://raw.githubusercontent.com/wiki/ChildMindInstitute/mindlogger-app/images/App-Store-Connect/TestFlight.png) ▶ ![BUILDS](https://raw.githubusercontent.com/wiki/ChildMindInstitute/mindlogger-app/images/App-Store-Connect/builds.png) ▶ ![iOS](https://raw.githubusercontent.com/wiki/ChildMindInstitute/mindlogger-app/images/App-Store-Connect/iOS.png) and click on the build number of the version to deploy to β testers (eg, `101` in this screenshot: ![Build 101](https://raw.githubusercontent.com/wiki/ChildMindInstitute/mindlogger-app/images/App-Store-Connect/build-101.png)).
        1. Click ![Test Details](https://raw.githubusercontent.com/wiki/ChildMindInstitute/mindlogger-app/images/App-Store-Connect/test-details.png).
        2. Fill in ![What to Test](https://raw.githubusercontent.com/wiki/ChildMindInstitute/mindlogger-app/images/App-Store-Connect/what-to-test.png). Typically you can just copy-paste from "What's new in this release?" in the Google Play Console.
        3. Click ![Save](https://raw.githubusercontent.com/wiki/ChildMindInstitute/mindlogger-app/images/App-Store-Connect/save.png).
        4. Click ![Testers](https://raw.githubusercontent.com/wiki/ChildMindInstitute/mindlogger-app/images/App-Store-Connect/testers.png).
        5. Click ![Groups ⊕](https://raw.githubusercontent.com/wiki/ChildMindInstitute/mindlogger-app/images/App-Store-Connect/groups.png) and add the tester groups you want to add to this build.
        6. If the major or minor [SemVer](#Versioning) is changed, also update the version in ![App Store](https://raw.githubusercontent.com/wiki/ChildMindInstitute/mindlogger-app/images/App-Store-Connect/app-store.png) ▶ ![iOS app](https://raw.githubusercontent.com/wiki/ChildMindInstitute/mindlogger-app/images/App-Store-Connect/iOS-app.png).
    4. Both Apple and Google will have some combination of bots and humans review the new version and release notes. Once approved, users will automatically get the update per their respective device settings.
