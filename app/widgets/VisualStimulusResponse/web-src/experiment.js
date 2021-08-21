function buildTimeline() {
  /* experiment parameters */
  const showFixation = window.CONFIG.showFixation === false ? false : true;
  const showFeedback = window.CONFIG.showFeedback === false ? false : true;
  const showResults = window.CONFIG.showResults === false ? false : true;
  const trialDuration = window.CONFIG.trialDuration || 1500;
  const fixationImage = window.CONFIG.fixation || '<div class="mindlogger-fixation">+</div>';
  const samplingMethod = window.CONFIG.samplingMethod || 'default';
  const sampleSize = window.CONFIG.samplingSize || 1;
  const minimumAccuracy = window.CONFIG.minimumAccuracy;
  const trialWeights = window.CONFIG.trials.map((trial) => {
    return trial.weight || 1;
  });

  /*set up instructions block*/
  var ready = {
    type: 'html-keyboard-response',
    stimulus: '<div class="mindlogger-message">Get ready</div>',
    choices: jsPsych.NO_KEYS,
    trial_duration: 1000,
    data: {
      tag: 'prepare',
    }
  };

  /*defining stimuli*/
  var test_stimuli = window.CONFIG.trials.map(trial => ({
    stimulus: trial.stimulus.en,
    choices: trial.choices.map(choice => choice.name.en),
    data: {
      tag: 'trial',
      correctChoice: trial.correctChoice,
    }
  }));

  var fixation = {
    type: 'html-keyboard-response',
    stimulus: fixationImage,
    choices: jsPsych.NO_KEYS,
    trial_duration: 500,
    data: {
      tag: 'fixation',
    }
  };

  var test = {
    type: 'html-button-response',
    choices: jsPsych.timelineVariable('choices'),
    trial_duration: trialDuration,
    stimulus: jsPsych.timelineVariable('stimulus'),
    data: jsPsych.timelineVariable('data'),
    on_finish: function (data) {
      if (data.correctChoice === parseInt(data.button_pressed) && data.rt > -1) {
        data.correct = true;
      } else {
        data.correct = false;
      }
    },
    post_trial_gap: 1000,
  };

  var feedback = {
    type: 'html-keyboard-response',
    stimulus: function () {
      const last = jsPsych.data.getLastTrialData().values()[0];
      if (last.rt === null) {
        return '<div class="mindlogger-message">Respond faster</div>';
      }
      if (last.correct === true) {
        return '<div class="mindlogger-message correct">Correct!</div>';
      }
      return '<div class="mindlogger-message incorrect">Incorrect</div>';
    },
    data: {
      tag: 'feedback',
    },
    choices: jsPsych.NO_KEYS,
    trial_duration: 500,
  };

  /* defining test timeline */
  const test_timeline = [];
  if (showFixation) {
    test_timeline.push(fixation);
  }
  test_timeline.push(test);
  if (showFeedback) {
    test_timeline.push(feedback);
  }

  var test_procedure = {
    timeline: test_timeline,
    timeline_variables: test_stimuli,
  };

  // Set up sampling methods
  // https://www.jspsych.org/overview/timeline/#sampling-methods
  if (samplingMethod === 'randomize-order') {
    test_procedure.randomize_order = true;
    test_procedure.repetitions = sampleSize;
  } else if (samplingMethod === 'sample-with-replacement') {
    test_procedure.sample = {
      type: 'with-replacement',
      size: sampleSize, // N trials, with replacement
      weights: trialWeights,
    };
  } else if (samplingMethod === 'sample-without-replacement') {
    test_procedure.sample = {
      type: 'without-replacement',
      size: sampleSize,  // N trials, without replacement
      weights: trialWeights,
    };
  } else if (samplingMethod === 'fixed-repetitions') {
    test_procedure.sample = {
      type: 'fixed-repetitions',
      size: 3, // N repetitions of each trial, order is randomized.
    };
  } else {
    test_procedure.repetitions = sampleSize; // N repetitions of each trial, fixed order
  }

  /*defining debriefing block*/
  var debrief = {
    type: "html-button-response",
    stimulus: function () {
      var total_trials = jsPsych.data.get().filter({ tag: 'trial' }).count();
      var accuracy = Math.round(jsPsych.data.get().filter({ correct: true }).count() / total_trials * 100);
      const rt = Math.round(jsPsych.data.get().filter({ correct: true }).select('rt').mean());

      let msg = "<p>You responded correctly on <strong>" + accuracy + "%</strong> of the trials.</p><p>Your average response time was <strong>" + rt + "ms</strong>.</p>";
      if (accuracy > minimumAccuracy) {
        msg = msg + '<p>Press the button below to continue.</p>';
      } else {
        msg = msg + '<p>Remember to respond only to the central arrow.</p><p>Press the button below to end current trial and restart.</p>'
      }
      return msg;
    },
    choices: ['Finish'],
    data: {
      tag: 'result',
    }
  };

  var end_block = {
    type: "html-button-response",
    stimulus: "<p>The experiment is complete.</p><p>Press the button below to continue.</p>",
    choices: ['Finish']
  };

  /*set up experiment structure*/
  var timeline = [];
  timeline.push(ready);
  timeline.push(test_procedure);
  showResults
    ? timeline.push(debrief)
    : timeline.push(end_block)
  return timeline;
}
