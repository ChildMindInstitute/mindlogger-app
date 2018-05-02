'use strict';

import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import SurveyStartScreen from './containers/SurveyStartScreen';
import SurveyQuestionScreen from './containers/SurveyQuestionScreen';
import SurveyBasicSummaryScreen from './containers/SurveyBasicSummaryScreen';
import SurveyTableSummaryScreen from './containers/SurveyTableSummaryScreen';
import SurveyBasicAccordionScreen from './containers/SurveyBasicAccordionScreen';
import SurveyTableAccordionScreen from './containers/SurveyTableAccordionScreen';
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
  <Scene key="survey_question" component={SurveyQuestionScreen} title="Question"/>,
  <Scene key="survey_basic_summary" component={SurveyBasicSummaryScreen} title="Question"/>,
  <Scene key="survey_accordion" component={SurveyBasicAccordionScreen} title="Accordion"/>,
  <Scene key="survey_table_accordion" component={SurveyTableAccordionScreen} title="Table"/>,
  <Scene key="survey_table_summary" component={SurveyTableSummaryScreen} title="Question"/>,
  <Scene key="survey_basic_add" component={SurveyBasicAddScreen} title="Survey"/>,
  <Scene key="survey_basic_edit_question" component={SurveyBasicEditQuestionScreen} title="Question"/>,
  <Scene key="survey_table_add" component={SurveyTableAddScreen} title="Survey"/>,
  <Scene key="survey_table_edit_question" component={SurveyTableEditQuestionScreen} title="Question"/>,
  ]
  )