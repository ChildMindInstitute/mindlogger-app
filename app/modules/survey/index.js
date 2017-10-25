'use strict';

import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import SurveyStartScreen from './containers/SurveyStartScreen';
import SurveyBasicQuestionScreen from './containers/SurveyBasicQuestionScreen';
import SurveyBasicAccordionScreen from './containers/SurveyBasicAccordionScreen';
import SurveyTableScreen from './containers/SurveyTableScreen';
import SurveyBasicAddScreen from './containers/add/BasicAddScreen';
import SurveyTableAddScreen from './containers/add/TableAddScreen'
import SurveyBasicEditQuestionScreen from './containers/add/BasicEditQuestionScreen';
import SurveyTableEditQuestionScreen from './containers/add/TableEditQuestionScreen';
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
  [
  <Scene key="survey" component={SurveyStartScreen}/>,
  <Scene key="survey_question" component={SurveyBasicQuestionScreen} title="Question"/>,
  <Scene key="survey_accordion" component={SurveyBasicAccordionScreen} title="Accordion"/>,
  <Scene key="survey_table" component={SurveyTableScreen} title="Table"/>,
  <Scene key="survey_basic_add" component={SurveyBasicAddScreen} title="Survey"/>,
  <Scene key="survey_basic_edit_question" component={SurveyBasicEditQuestionScreen} title="Question"/>,
  <Scene key="survey_table_add" component={SurveyTableAddScreen} title="Survey"/>,
  <Scene key="survey_table_edit_question" component={SurveyTableEditQuestionScreen} title="Question"/>,
  ]
  )