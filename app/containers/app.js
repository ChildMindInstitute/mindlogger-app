import React, {Component} from 'react';
import { StyleSheet } from 'react-native';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
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

import * as reducers from '../reducers';
import mainApp from './mainApp';
import SurveyApp from '../modules/survey';

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
const reducer = combineReducers(reducers);
const store = createStoreWithMiddleware(reducer);
const styles = StyleSheet.create({
  
});

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router
        >
          <Modal>
          <Scene key="home" component={mainApp}/>
            
          <Scene key="survey" component={SurveyApp} title="Survey"/>
          </Modal>
        </Router>
      </Provider>
    );
  }
}
