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

const getImage = (image, alt, isButton=false) => {
  if (image) {
    return `<img src="${image}" alt="${alt}">`
  }

  if (isButton) {
    return `<span class="button-text">${alt}</span>`
  }

  return alt;
}

const getTrials = (stimulusScreens, blocks, buttons, samplingMethod) => {
  const trials = [];

  const choices = buttons.map(button => ({
    value: button.value,
    name: { en: Platform.OS === 'ios' ? getImageNative(button.image, button.name.en) : getImage(button.image, button.name.en, true) }
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

export const VisualStimulusResponse = ({ onChange, config, isCurrent, appletId, flankerPosition }) => {
  const [loading, setLoading] = useState(true);
  const [scriptInjected, setScriptInjected] = useState(false);
  const [responses, setResponses] = useState([]);
  const webView = useRef();
 
  let onEndGame = (result) => {
    const dataString = result.nativeEvent.data;
    const dataObject = JSON.parse(dataString);
    const dataType = result.nativeEvent.type;
    
    if (dataObject.trial_index > configObj.trials.length) return
    
    if (dataType == 'response') {
      setResponses(responses.concat([dataObject]));

      sendData('live_event', parseResponse(dataObject), appletId);
      return ;
    }

    onChange(responses.map(response => parseResponse(response)), true);
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

  const fixation = Platform.OS === 'ios' ? getImageNative(config.fixationScreen.image, config.fixationScreen.value) : getImage(config.fixationScreen.image, config.fixationScreen.value);

  const configObj = {
    trials: getTrials(screens, config.blocks, config.buttons, config.samplingMethod),
    fixationDuration: config.fixationDuration,
    fixation,
    showFixation: config.showFixation !== false && fixation.length > 0,
    showFeedback: config.showFeedback !== false,
    showResults: config.showResults !== false,
    trialDuration: config.trialDuration || 1500,
    samplingMethod: 'fixed-order',
    samplingSize: config.sampleSize,
    buttonLabel: !config.lastTest && config.nextButton || 'Finish',
    minimumAccuracy: config.minimumAccuracy || 0,
    continueText,
    restartText: config.lastPractice ? continueText : restartText,
  };
  let screenCountPerTrial = 1;
  if (configObj.showFeedback) {
    screenCountPerTrial++;
  }

  if (configObj.showFixation) {
    screenCountPerTrial++;
  }

  const injectConfig = `
    try {
      const consoleLog = (type, log) => window.ReactNativeWebView.postMessage(JSON.stringify({'type': 'Console', 'data': {'type': type, 'log': log}}));
      console = {
        log: (log) => consoleLog('log', log),
        debug: (log) => consoleLog('debug', log),
        info: (log) => consoleLog('info', log),
        warn: (log) => consoleLog('warn', log),
        error: (log) => consoleLog('error', log),
      };
    } catch {}

    window.CONFIG = ${JSON.stringify(configObj)};
    start();
  `;

  const source = Platform.select({
    ios: htmlSource,
    android: { uri: 'file:///android_asset/html/visual-stimulus-response.html' },
  });

  useEffect(() => {
    if(!isCurrent || Platform.OS !== 'ios') {
      return;
    }

    // todo - review how to avoid setTimeout. Currently it's needed because of
    // race condition: FlankerView.swift may be created later than startGame
    setTimeout(() => {
      NativeModules.FlankerViewManager.setGameParameters(JSON.stringify(configObj))
      NativeModules.FlankerViewManager.startGame(flankerPosition.isFirst, flankerPosition.isLast)
    }, 600)
  }, [isCurrent])

  useEffect(() => {
    if(Platform.OS !== 'ios') {
      return;
    }
    NativeModules.FlankerViewManager.preloadGameImages(JSON.stringify(configObj))
  })

  useEffect(() => {
    if(!isCurrent || Platform.OS !== 'android') { 
      return;
    }
    if(!loading && !scriptInjected) {
      webView.current.injectJavaScript(injectConfig);
      setScriptInjected(true);
    }
  }, [isCurrent, loading, scriptInjected])

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
    response_touch_timestamp: Platform.OS === 'ios' ? record.response_touch_timestamp : (record.rt ? record.start_timestamp + record.rt : null)
  })

  if (!isCurrent) {
    return (
      <View
        style={{
          height: '100%',
          position: 'relative',
        }}
      >
        <Text>DEBUG: Is not current</Text>
      </View>)
  }

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

        onEndGame = { onEndGame }
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
                return;
              } else if (type == 'Console') {
                // Uncomment below to observe console.log from webview
                //console.info(`[Console] ${JSON.stringify(data)}`);
                return;
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
