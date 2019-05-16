import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

export const VisualStimulusResponse = ({ onChange, config, isCurrent }) => {
  if (isCurrent) {
    // Prepare config data for injecting into the WebView
    const trials = config.trials.map(trial => ({
      stimulus: trial.image,
      choices: trial.valueConstraints.itemList,
      correctChoice: typeof trial.value === 'undefined' ? -1 : trial.value,
      weight: typeof trial.weight === 'undefined' ? 1 : trial.weight,
    }));

    const configObj = {
      trials,
      showFixation: config.showFixation !== false ? 'true' : 'false',
      showFeedback: config.showFeedback !== false ? 'true' : 'false',
      showResults: config.showResults !== false ? 'true' : 'false',
      trialDuration: config.trialDuration || 1500,
      samplingMethod: config.samplingMethod,
      samplingSize: config.samplingSize,
    };

    const injectConfig = `
      window.CONFIG = ${JSON.stringify(configObj)};
      start();
    `;

    return (
      <WebView
        source={require('./compressed.html')}
        originWhitelist={['*']}
        style={{ flex: 1, height: '100%' }}
        scrollEnabled={false}
        injectedJavaScript={injectConfig}
        onMessage={(e) => {
          const dataString = e.nativeEvent.data;
          const data = JSON.parse(dataString);
          onChange(data);
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
      image: PropTypes.object,
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
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  isCurrent: PropTypes.bool.isRequired,
};
