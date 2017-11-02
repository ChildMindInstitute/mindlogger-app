'use strict';
import React, {Component} from 'react';
import AudioAddScreen from './containers/AudioAddScreen';
import AudioStartScreen from './containers/AudioStartScreen';
import AudioActivityScreen from './containers/AudioActivityScreen';
import {
    Scene,
  } from 'react-native-router-flux';
export default (
[
    <Scene key="audio_add" component={AudioAddScreen} title="Audio Add"/>,
    <Scene key="audio_start" component={AudioStartScreen} title="Audio Add"/>,
    <Scene key="audio_activity" component={AudioActivityScreen} title="Audio Activity"/>
]
)