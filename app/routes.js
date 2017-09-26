import React, {Component} from 'react';
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
import { StyleSheet } from 'react-native';
import CounterApp from './containers/counterApp';
import SurveyApp from './modules/survey';
const styles = StyleSheet.create({
  
});

let routes = (
  <Router
    sceneStyle={styles}
  >
    <Stack key="root">
      <Scene key="login" component={CounterApp} title="Login"/>
      <Scene key="register" component={CounterApp} title="Register"/>
      <Stack key="modules">
        <Scene key="survey" component={SurveyApp}/>
      </Stack>
    </Stack>
  </Router>);
export default routes;