'use strict';
import React, {Component} from 'react';
import DrawingAddScreen from './containers/DrawingAddScreen';
import DrawingStartScreen from './containers/DrawingStartScreen';
import DrawingActivityScreen from './containers/DrawingActivityScreen';
import {
    Scene,
  } from 'react-native-router-flux';
export default (
[
    <Scene key="drawing_add" component={DrawingAddScreen} title="Drawing Add"/>,
    <Scene key="drawing_start" component={DrawingStartScreen} title="Drawing Add"/>,
    <Scene key="drawing_activity" component={DrawingActivityScreen} title="Drawing Activity"/>
]
)