
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { BackHandler, StatusBar, NavigationCardStack, Platform } from 'react-native';
import { connect } from 'react-redux';
import { Root, StyleProvider, variables, Drawer } from 'native-base';
import { Router, Scene, Actions } from 'react-native-router-flux';

import getTheme from '../native-base-theme/components';
import material from '../native-base-theme/variables/material';
import { closeDrawer } from './actions/drawer';

// Main Screens
import Home from './components/home/';
import SplashPage from './components/splashscreen/';
import SideBar from './components/sidebar';
import ActivityScreen from './containers/activity/';
import Login from './containers/login';
import ForgotPassword from './containers/login/forgot-password';
import Consent from './containers/login/consent';
import Signup from './containers/login/signup';
import Settings from './containers/settings';

//Modules

import SurveyScenes from './modules/survey';
import VoiceScenes from './modules/voice/routes';
import DrawingScenes from './modules/drawing/routes';


import statusBarColor from './themes/variables';

const RouterWithRedux = connect()(Router);

class AppNavigator extends Component {

  static propTypes = {
    drawerState: PropTypes.string,
    closeDrawer: PropTypes.func,
    themeState: PropTypes.string,
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', () => {
      Actions.pop();
      return true;
    });
  }

  componentDidUpdate() {
    if (this.props.drawerState === 'opened') {
      this.openDrawer();
    }

    if (this.props.drawerState === 'closed') {
      this._drawer._root.close();
    }
  }

  popRoute() {
    Actions.pop();
  }

  openDrawer() {
    this._drawer._root.open();
  }

  closeDrawer() {
    if (this.props.drawerState === 'opened') {
      this.props.closeDrawer();
    }
  }

  render() {
    console.log("Theme:",getTheme((this.props.themeState === 'material') ? material : undefined))
    return (
      <StyleProvider style={getTheme((this.props.themeState === 'material') ? material : undefined)}>
        <Drawer
          ref={(ref) => { this._drawer = ref; }}
          content={<SideBar navigator={this._navigator} />}
          onClose={() => this.closeDrawer()}
        >
          <StatusBar
            hidden={(this.props.drawerState === 'opened' && Platform.OS === 'ios') ? true : false}
            backgroundColor={statusBarColor.statusBarColor}
          />
          <RouterWithRedux>
            <Scene key="root" hideNavBar>
              <Scene key="login" component={Login} initial={true}/>
              <Scene key="consent" component={Consent}/>
              <Scene key="sign_up" component={Signup}/>
              <Scene key="forgot_password" component={ForgotPassword}/>
              <Scene key="settings" component={Settings}/>
              <Scene key="activity" component={ActivityScreen}/>
              {SurveyScenes}
              {VoiceScenes}
              {DrawingScenes}
            </Scene>
          </RouterWithRedux>
        </Drawer>
      </StyleProvider>
    );
  }
}

const bindAction = dispatch => ({
  closeDrawer: () => dispatch(closeDrawer()),
  popRoute: key => dispatch(popRoute(key)),
});

const mapStateToProps = state => ({
  drawerState: state.drawer.drawerState,
  themeState: state.drawer.themeState,
});

export default connect(mapStateToProps, bindAction)(AppNavigator);
