function buildTimeline() {
  /* experiment parameters */
  const reps_per_trial_type = window.CONFIG.experimentLength
    ? Math.round(window.CONFIG.experimentLength / 4)
    : 3;
  const showFixation = window.CONFIG.showFixation === false ? false : true;
  const showFeedback = window.CONFIG.showFeedback === false ? false : true;
  const showResults = window.CONFIG.showResults === false ? false : true;
  const trialDuration = window.CONFIG.trialDuration || 1500;

  /*set up instructions block*/
  var ready = {
    type: 'html-keyboard-response',
    stimulus: '<div class="mindlogger-message">Get ready</div>',
    choices: jsPsych.NO_KEYS,
    trial_duration: 1000,
  };

  /*defining stimuli*/
  var test_stimuli = [
    {
      stimulus: `
        <div class="centerbox">
          <div class="mindlogger-flanker-image-container">
            <img alt="left" src="${window.CONFIG.leftImage}" class="mindlogger-flanker-image" />
            <img alt="left" src="${window.CONFIG.leftImage}" class="mindlogger-flanker-image" />
            <img alt="left" src="${window.CONFIG.leftImage}" class="mindlogger-flanker-image" />
            <img alt="left" src="${window.CONFIG.leftImage}" class="mindlogger-flanker-image" />
            <img alt="left" src="${window.CONFIG.leftImage}" class="mindlogger-flanker-image" />
          </div>
        </div>
      `,
      data: { stim_type: 'congruent', direction: 'left', tag: 'flanker_test' }
    },
    {
      stimulus: `
        <div class="centerbox">
          <div class="mindlogger-flanker-image-container">
            <img alt="right" src="${window.CONFIG.rightImage}" class="mindlogger-flanker-image" />
            <img alt="right" src="${window.CONFIG.rightImage}" class="mindlogger-flanker-image" />
            <img alt="right" src="${window.CONFIG.rightImage}" class="mindlogger-flanker-image" />
            <img alt="right" src="${window.CONFIG.rightImage}" class="mindlogger-flanker-image" />
            <img alt="right" src="${window.CONFIG.rightImage}" class="mindlogger-flanker-image" />
          </div>
        </div>
      `,
      data: { stim_type: 'congruent', direction: 'right', tag: 'flanker_test' }
    },
    {
      stimulus: `
        <div class="centerbox">
          <div class="mindlogger-flanker-image-container">
            <img alt="left" src="${window.CONFIG.leftImage}" class="mindlogger-flanker-image" />
            <img alt="left" src="${window.CONFIG.leftImage}" class="mindlogger-flanker-image" />
            <img alt="right" src="${window.CONFIG.rightImage}" class="mindlogger-flanker-image" />
            <img alt="left" src="${window.CONFIG.leftImage}" class="mindlogger-flanker-image" />
            <img alt="left" src="${window.CONFIG.leftImage}" class="mindlogger-flanker-image" />
          </div>
        </div>
      `,
      data: { stim_type: 'incongruent', direction: 'right', tag: 'flanker_test' }
    },
    {
      stimulus: `
        <div class="centerbox">
          <div class="mindlogger-flanker-image-container">
            <img alt="right" src="${window.CONFIG.rightImage}" class="mindlogger-flanker-image" />
            <img alt="right" src="${window.CONFIG.rightImage}" class="mindlogger-flanker-image" />
            <img alt="left" src="${window.CONFIG.leftImage}" class="mindlogger-flanker-image" />
            <img alt="right" src="${window.CONFIG.rightImage}" class="mindlogger-flanker-image" />
            <img alt="right" src="${window.CONFIG.rightImage}" class="mindlogger-flanker-image" />
          </div>
        </div>
      `,
      data: { stim_type: 'incongruent', direction: 'left', tag: 'flanker_test' }
    }
  ];

  var fixation = {
    type: 'html-keyboard-response',
    stimulus: '<div class="mindlogger-fixation">+</div>',
    choices: jsPsych.NO_KEYS,
    trial_duration: 1000,
  };

  var choices = [
    `<img alt="left-button" src="${window.CONFIG.leftImageButton}" class="mindlogger-flanker-image-button" />`,
    `<img alt="right-button" src="${window.CONFIG.rightImageButton}" class="mindlogger-flanker-image-button" />`
  ];

  var test = {
    type: 'html-button-response',
    choices: choices,
    trial_duration: trialDuration,
    stimulus: jsPsych.timelineVariable('stimulus'),
    data: jsPsych.timelineVariable('data'),
    on_finish: function (data) {
      var correct = false;
      if (data.direction == 'left' && data.button_pressed == 0 && data.rt > -1) {
        correct = true;
      } else if (data.direction == 'right' && data.button_pressed == 1 && data.rt > -1) {
        correct = true;
      }
      data.correct = correct;
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
    choices: jsPsych.NO_KEYS,
    trial_duration: 1000,
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
    sample: { type: 'fixed-repetitions', size: reps_per_trial_type }
  };

  /*defining debriefing block*/
  var debrief = {
    type: "html-button-response",
    stimulus: function () {
      var total_trials = jsPsych.data.get().filter({ tag: 'flanker_test' }).count();
      var accuracy = Math.round(jsPsych.data.get().filter({ correct: true }).count() / total_trials * 100);
      var congruent_rt = Math.round(jsPsych.data.get().filter({ correct: true, stim_type: 'congruent' }).select('rt').mean());
      var incongruent_rt = Math.round(jsPsych.data.get().filter({ correct: true, stim_type: 'incongruent' }).select('rt').mean());

      let msg = "<p>You responded correctly on <strong>" + accuracy + "%</strong> of the trials.</p> ";

      if (!isNaN(congruent_rt)) {
        msg += "<p>Your average response time for congruent trials was <strong>" + congruent_rt + "ms</strong>.</p>";
      } else {
        msg += "<p>You did not answer any congruent trials correctly.</p>";
      }

      if (!isNaN(incongruent_rt)) {
        msg += "<p>Your average response time for incongruent trials was <strong>" + incongruent_rt + "ms</strong>.</p>";
      } else {
        msg += "<p>You did not answer any incongruent trials correctly.</p>";
      }

      msg += "<p>Press the button below complete the experiment. Thank you!</p>";

      return msg;
    },
    choices: ['Finish']
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
