'use strict';
import React, {Component} from 'react';
import VoiceAddScreen from './containers/VoiceAddScreen';
import VoiceStartScreen from './containers/VoiceStartScreen';
import VoiceActivityScreen from './containers/VoiceActivityScreen';
import {
    Scene,
  } from 'react-native-router-flux';
export default (
[
    <Scene key="voice_add" component={VoiceAddScreen} title="Voice Add"/>,
    <Scene key="voice_start" component={VoiceStartScreen} title="Voice Add"/>,
    <Scene key="voice_activity" component={VoiceActivityScreen} title="Voice Activity"/>
]
)