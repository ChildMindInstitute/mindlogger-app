
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
import ActivityScreen from './containers/activity/main';
import Login from './containers/login';
import ForgotPassword from './containers/login/forgot-password';
import Consent from './containers/login/consent';
import Signup from './containers/login/signup';
import Settings from './containers/settings';
import About from './containers/about';
import AboutApp from './containers/about/app';
import FrequencyScreen from './containers/activity/frequency';

import Act from './containers/activity/act';
import PushAct from './containers/activity/push-act';
import ActInfo from './containers/activity/info-act';
import VolumeInfo from './containers/activity/volume-info';


import statusBarColor from './themes/variables';
import DrawerCheck from './DrawerCheck';

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

  // componentDidUpdate() {
  //   if (this.props.drawerState === 'opened') {
  //     this.openDrawer();
  //   }

  //   if (this.props.drawerState === 'closed') {
  //     this._drawer._root.close();
  //   }
  // }

  popRoute() {
    Actions.pop();
  }

  openDrawer = () => {
    this._drawer._root.open();
  }

  closeDrawer = () => {
    this._drawer._root.close();
  }

  onCloseDrawer = () => {
    this.props.closeDrawer();
  }

  render() {
    console.log("Theme:",getTheme((this.props.themeState === 'material') ? material : undefined))
    return (
      <StyleProvider style={getTheme((this.props.themeState === 'material') ? material : undefined)}>
        <Drawer
          ref={(ref) => { this._drawer = ref; }}
          content={<SideBar navigator={this._navigator}/>}
          onClose={() => this.onCloseDrawer()}
        >
          <StatusBar
            hidden={(this.props.drawerState === 'opened' && Platform.OS === 'ios') ? true : false}
            backgroundColor={statusBarColor.statusBarColor}
          />
          <DrawerCheck onOpenDrawer={this.openDrawer} onCloseDrawer={this.closeDrawer}/>
          <RouterWithRedux>
            <Scene key="root" hideNavBar>
              <Scene key="login" component={Login} initial={true}/>
              <Scene key="about" component={About} />
              <Scene key="consent" component={Consent}/>
              <Scene key="sign_up" component={Signup}/>
              <Scene key="forgot_password" component={ForgotPassword}/>
              <Scene key="settings" component={Settings}/>
              <Scene key="activity" component={ActivityScreen}/>
              <Scene key="frequency" component={FrequencyScreen}/>
              <Scene key='push_act' component={PushAct} />
              <Scene key='take_act' component={Act} />
              <Scene key='about_act' component={ActInfo} />
              <Scene key='about_volume' component={VolumeInfo} />
              <Scene key='about_app' component={AboutApp} />
              {/* {SurveyScenes}
              {VoiceScenes}
              {DrawingScenes} */}
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
  
  themeState: state.drawer.themeState,
});

export default connect(mapStateToProps, bindAction)(AppNavigator);
