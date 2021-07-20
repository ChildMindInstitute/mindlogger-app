import React from 'react';
import PropTypes from 'prop-types';
import { View, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

const htmlSource = require('./visual-stimulus-response.html');

export const VisualStimulusResponse = ({ onChange, config, isCurrent }) => {
  if (isCurrent) {
    // Prepare config data for injecting into the WebView
    const trials = config.trials.map(trial => ({
      stimulus: {
        en: trial.image
      },
      choices: trial.valueConstraints.itemList,
      correctChoice: typeof trial.value === 'undefined' ? -1 : trial.value,
      weight: typeof trial.weight === 'undefined' ? 1 : trial.weight,
    }));

    const configObj = {
      trials,
      showFixation: config.showFixation !== false,
      showFeedback: config.showFeedback !== false,
      showResults: config.showResults !== false,
      trialDuration: config.trialDuration || 1500,
      samplingMethod: config.samplingMethod,
      samplingSize: config.samplingSize,
    };

    const injectConfig = `
      window.CONFIG = ${JSON.stringify(configObj)};
      start();
    `;

    const source = Platform.select({
      ios: htmlSource,
      android: { uri: 'file:///android_asset/html/visual-stimulus-response.html' },
    });

    return (
      <WebView
        source={source}
        originWhitelist={['*']}
        style={{ flex: 1, height: '100%' }}
        scrollEnabled={false}
        injectedJavaScript={injectConfig}
        onMessage={(e) => {
          const dataString = e.nativeEvent.data;
          const data = JSON.parse(dataString);

          onChange(data.map(record => ({
            delay: record.rt,
            question: record.stimulus,
            button_pressed: record.button_pressed,
            start_time: record.start_time,
            image_time: record.image_time,
            correct: record.correct
          })));
        }}
      />
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }} />
  );
};

VisualStimulusResponse.propTypes = {
  config: PropTypes.shape({
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
    samplingMethod: PropTypes.string,
    samplingSize: PropTypes.number,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  isCurrent: PropTypes.bool.isRequired,
};
