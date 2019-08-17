import React, { Component } from 'react';
import { BackHandler } from 'react-native';
import { StyleProvider } from 'native-base';
import PropTypes from 'prop-types';
import { Router, Scene, Lightbox, Actions, Stack, Drawer, ActionConst, Modal } from 'react-native-router-flux';
import getTheme from '../../native-base-theme/components';
import platform from '../../native-base-theme/variables/platform';
import { getStore } from '../store';
// Scenes
import About from './About';
import AboutApp from './AboutApp';
import Activity from './Activity';
import ActivityDetails from './ActivityDetails';
import ActivityThanks from './ActivityThanks';
import AppletDetails from './AppletDetails';
import AppletList from './AppletList';
import ChangeStudy from './ChangeStudy';
import Consent from './Consent';
import ForgotPassword from './ForgotPassword';
import InfoAct from './InfoAct';
import Login from './Login';
import LogoutWarning from './LogoutWarning';
import Settings from './Settings';
import ChangePassword from './ChangePassword';
import SideBar from './Sidebar';
import Signup from './Signup';
import Splash from './Splash';
import VolumeInfo from './VolumeInfo';

// eslint-disable-next-line
const Navigator = (initialState) => Actions.create(
  <Lightbox>
    <Modal hideNavBar>
      <Scene key="root" hideNavBar>
        <Drawer key="side_menu" contentComponent={SideBar}>
          <Scene hideNavBar panHandlers={null} drawerLockMode="locked-closed">
            <Scene key="splash" component={Splash} hideNavBar initial />
            <Scene key="about_act" component={InfoAct} />
            <Scene key="about_app" component={AboutApp} />
            <Scene key="about_volume" component={VolumeInfo} />
            <Scene key="about" component={About} />
            <Scene key="activity_details" component={ActivityDetails} />
            <Scene key="applet_details" component={AppletDetails} />
            <Scene key="applet_list" component={AppletList} />
            <Scene key="change_study" component={ChangeStudy} />
            <Scene key="consent" component={Consent} />
            <Scene key="forgot_password" component={ForgotPassword} />
            <Scene key="login" component={Login} />
            <Scene key="settings" component={Settings} />
            <Scene key="change_password" component={ChangePassword} />
            <Scene key="sign_up" component={Signup} />
          </Scene>
        </Drawer>
      </Scene>
      <Scene key="take_act" component={Activity} />
      <Scene key="activity_thanks" component={ActivityThanks} />
      </Modal>
    </Lightbox>
  ,
);

class AppNavigator extends Component {
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', () => {
      Actions.pop();
      return true;
    });
  }

  render() {
    const state = this.props.store.getState();
    console.log('state at nav', state);
    return (
      <StyleProvider style={getTheme(platform)}>
        <Router navigator={Navigator(this.props.store)} />
      </StyleProvider>
    );
  }
}

AppNavigator.propTypes = {
  store: PropTypes.object.isRequired,
};

export default AppNavigator;
