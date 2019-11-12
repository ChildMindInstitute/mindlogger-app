# VisualStimulusResponse widget

## About

This widget allows you to preset a series of timed trials. In each trial the user is presented with a visual stimulus and has to press a button in response.

## Building HTML for WebView

React Native WebView does not handle local web sites well. As a workaround we can inline the CSS and JS files using the [inliner](https://github.com/remy/inliner) Node utility which is included as a dev dependency. A Bash script has been made to run `inliner` and copy the results to the Android assets directory. You can run the script as follows on Linux and OSX:

```
./build-html.sh
```

You must run the script every time you make a change in `web-src`.

## Config

The `VisualStimulusResponse` widget accepts a `config` object. The `config` object can have the following properties:

```js
trials: PropTypes.arrayOf(PropTypes.shape({
  image: PropTypes.string,
  valueConstraints: PropTypes.object,
  value: PropTypes.number,
  weight: PropTypes.number,
})),
showFixation: PropTypes.bool,
showFeedback: PropTypes.bool,
showResults: PropTypes.bool,
trialDuration: PropTypes.number,
repetitions: PropTypes.number,
samplingMethod: PropTypes.string,
samplingSize: PropTypes.number,
```

#### trials

The `trials` prop defines the visual stimuli and buttons to show to the user. The `image` property accepts html. The `valueConstraints` prop defines the buttons a user can press to respond. Usually you will get this data from the backend. 

In the following example there is only one trial which contains a random image from the internet. The user has two choices they can make: Like or Dislike. The correct answer is always "Like" in this case.

```js
trials: [
  {
    image: '<img src="https://picsum.photos/200/300" />',
    value: 0,
    valueConstraints: {
      itemList: [{
        name: {
          en: 'Like'
        },
        value: 0
      }, {
        name: {
          en: 'Dislike'
        },
        value: 1
      }]
    },
    weight: 1
  }
]
```

The `weight` property is used for the `sample-with-replacement` and `sample-without-replacement` sampling methods and determines how frequently a trial is sampled.

#### showFixation

Determines whether the user should be shown a fixation point plus sign before each trial to focus their gaze.

#### showFeedback

Controls whether the user should be told whether they answered correctly

#### showResults

Controls whether the user should be shown a debrief screen at the end of the task with their results.

#### trialDuration

Length of time, in milliseconds, each trial should be shown to the user.

#### samplingMethod

Options are `randomize-order`, `sample-with-replacement`, `sample-without-replacement`, and `fixed-repetitions`. If no value is specified the trials will be shown in order. See [here](https://www.jspsych.org/overview/timeline/#sampling-methods) for more information on sampling methods.

#### samplingSize

If `samplingMethod` is `sample-with-replacement`, `sample-without-replacement` or `randomize-order` then this determines the total number of trials shown. Otherwise, this controls the number of times that **each** trial will be shown, i.e. the number of times the trials are looped.
