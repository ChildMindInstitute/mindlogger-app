'use strict';

import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import SurveyStartScreen from './containers/SurveyStartScreen';
import SurveyQuestionScreen from './containers/SurveyQuestionScreen';
import SurveySummaryScreen from './containers/SurveySummaryScreen';
//import * as counterActions from '../actions';
import { Container, Header, Content, Footer, Text } from 'native-base';
import { connect } from 'react-redux';
import {
  Scene,
  Router,
  Actions,
  Reducer,
  ActionConst,
  Overlay,
  Tabs,
  Modal,
  Drawer,
  Stack,
  Lightbox,
} from 'react-native-router-flux';

export default (
  [<Scene key="survey" component={SurveyStartScreen}/>,
  <Scene key="survey_question" component={SurveyQuestionScreen} title="Question"/>,
  <Scene key="survey_summary" component={SurveySummaryScreen} title="Summary"/>
  ]
  )