import React, { useState, useRef, useEffect, Component } from 'react';
import PropTypes from 'prop-types';
import { Text, StyleSheet, View, Platform, ActivityIndicator, NativeModules, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { sendData } from "../../services/socket";
import FlankerView from './FlankerView';

const htmlSource = require('./visual-stimulus-response.html');

const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const getImageNative = (image, alt) => {
  if (image) {
    return image
  }

  return alt;
}

const getImage = (image, alt) => {
  if (image) {
    return `<img src="${image}" alt="${alt}">`
  }

  return alt;
}

const getTrials = (stimulusScreens, blocks, buttons, samplingMethod) => {
  const trials = [];

  const choices = buttons.map(button => ({
    value: button.value,
    name: { en: Platform.OS === 'ios' ? getImageNative(button.image, button.name.en) : getImage(button.image, button.name.en) }
  }));

  for (const block of blocks) {
    const order = samplingMethod == 'randomize-order' ? shuffle([...block.order]) : block.order;

    for (const item of order) {
      const screen = stimulusScreens.find(screen => screen.id == item);
      if (screen) {
        trials.push({
          ...screen,
          choices
        });
      }
    }

  }

  return trials;
}

export const VisualStimulusResponse = ({ onChange, config, isCurrent, appletId }) => {
  const [loading, setLoading] = useState(true);
  const webView = useRef();

  let onEndGame = (result: Object) => {
    const dataString = result.nativeEvent.data;
    const dataObject = JSON.parse(dataString);
    const dataType = result.nativeEvent.type;
    console.log(parseResponse(dataObject))
    if (dataType == 'response') {
      sendData('live_event', parseResponse(dataObject), appletId);
      return ;
    }

    onChange(dataObject.map(record => parseResponse(record)), true);
  };

  // Prepare config data for injecting into the WebView
  const screens = config.trials.map(trial => ({
    id: trial.id,
    stimulus: { en: Platform.OS === 'ios' ? getImageNative(trial.image, trial.name.en) : getImage(trial.image, trial.name.en) },
    correctChoice: typeof trial.value === 'undefined' ? -1 : trial.value,
    weight: typeof trial.weight === 'undefined' ? 1 : trial.weight,
  }));

  const continueText = [
    `Press the button below to ${config.lastTest ? 'finish' : 'continue'}.`
  ];
  const restartText = [
    'Remember to respond only to the central arrow.',
    'Press the button below to end current block and restart.'
  ];

  const configObj = {
    trials: getTrials(screens, config.blocks, config.buttons, config.samplingMethod),
    fixationDuration: config.fixationDuration,
    fixation: Platform.OS === 'ios' ? getImageNative(config.fixationScreen.image, config.fixationScreen.value) : getImage(config.fixationScreen.image, config.fixationScreen.value),
    showFixation: config.showFixation !== false,
    showFeedback: config.showFeedback !== false,
    showResults: config.showResults !== false,
    trialDuration: config.trialDuration || 1500,
    samplingMethod: config.samplingMethod,
    samplingSize: config.sampleSize,
    buttonLabel: config.nextButton || 'Finish',
    minimumAccuracy: config.minimumAccuracy || 0,
    continueText,
    restartText: config.lastPractice ? continueText : restartText,
  };
  const screenCountPerTrial = configObj.showFeedback ? 3 : 2;

  const injectConfig = `
    window.CONFIG = ${JSON.stringify(configObj)};
    start();
  `;

  const source = Platform.select({
    ios: htmlSource,
    android: { uri: 'file:///android_asset/html/visual-stimulus-response.html' },
  });

  useEffect(() => {
    if (isCurrent) {
      if(Platform.OS === 'ios') {
        NativeModules.FlankerViewManager.parameterGameType(config.blockType == "test" ? 1 : 0, JSON.stringify(configObj));
        NativeModules.FlankerViewManager.parameterGame(true, configObj.trials.length, 0);
      } else {
        webView.current.injectJavaScript(injectConfig);
      }
    }
  }, [isCurrent])

  const parseResponse = (record) => ({
    trial_index: Platform.OS === 'ios' ? record.trial_index : Math.ceil((record.trial_index + 1) / screenCountPerTrial),
    duration: record.rt,
    question: record.stimulus,
    button_pressed: record.button_pressed,
    start_time: Platform.OS === 'ios' ? record.start_time : record.image_time,
    correct: record.correct,
    start_timestamp: Platform.OS === 'ios' ? record.image_time : record.start_timestamp,
    offset: Platform.OS === 'ios' ? 0 : record.start_timestamp - record.start_time,
    tag: record.tag,
    response_touch_timestamp: Platform.OS === 'ios' ? record.response_touch_timestamp : record.start_timestamp + record.rt
  })

  if (Platform.OS === 'ios') {
    return (
      <View
        style={{
          height: '100%',
          position: 'relative',
        }}
      >
      <View
        style={{
            backgroundColor: 'white',
            width: '100%',
            height: '100%',
            flex: 1,
            osition: 'absolute',
            alignItems: 'center',
            justifyContent: 'center'
        }}
      >
      <FlankerView
        style={{
            backgroundColor: 'white',
            width: '100%',
            height: '100%',
            flex: 1,
            position: 'absolute',
            alignItems: 'center',
            justifyContent: 'center' }}
            onEndGame={onEndGame}
            dataJson ={JSON.stringify(configObj)}
      />
      </View>
      </View>
    );
  } else {
      return (
        <View
          style={{
            height: '100%',
            position: 'relative'
          }}
        >
          <WebView
            ref={(ref) => webView.current = ref}
            style={{ flex: 1, height: '100%' }}
            onLoad={() => setLoading(false)}
            source={source}
            originWhitelist={['*']}
            scrollEnabled={false}
            injectedJavaScript={`preloadButtonImages(${JSON.stringify(config.buttons)})`}
            onMessage={(e) => {
              const dataString = e.nativeEvent.data;
              const { type, data } = JSON.parse(dataString);

              if (type == 'response') {
                sendData('live_event', parseResponse(data), appletId);
                return ;
              }

              setLoading(true);

              setTimeout(() => {
                onChange(data.filter(trial => trial.tag != 'result' && trial.tag != 'prepare').map(record => parseResponse(record)), true);
              }, 0)
            }}
          />

          {
            loading && (
              <View
                style={{
                  backgroundColor: 'white',
                  width: '100%',
                  height: '100%',
                  flex: 1,
                  position: 'absolute',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ActivityIndicator size="large" />
              </View>
            ) || <></>
          }
        </View>
      );
    }
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
  appletId: PropTypes.string.isRequired,
};
