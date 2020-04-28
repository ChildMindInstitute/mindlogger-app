import React, { Component } from 'react';
import { BackHandler } from 'react-native';
import { StyleProvider } from 'native-base';
import { Router, Scene, Lightbox, Actions, Modal } from 'react-native-router-flux';
import getTheme from '../../native-base-theme/components';
import platform from '../../native-base-theme/variables/platform';
// Scenes
import AboutApp from './AboutApp';
import Activity from './Activity';
import ActivityDetails from './ActivityDetails';
import ActivityThanks from './ActivityThanks';
import AppletDetails from './AppletDetails';
import AppletList from './AppletList';
import Consent from './Consent';
import ForgotPassword from './ForgotPassword';
import InfoAct from './InfoAct';
import Login from './Login';
import LogoutWarning from './LogoutWarning';
import Settings from './Settings';
import ChangePassword from './ChangePassword';
// import SideBar from './Sidebar';
import Splash from './Splash';
import VolumeInfo from './VolumeInfo';
// import { colors } from '../themes/colors';
import AppletInviteFlow from './AppletInviteFlow';
import AppletSettings from './AppletSettings';

const theme = getTheme(platform);
theme['NativeBase.Footer'].height = 80;
theme['NativeBase.FooterTab']['NativeBase.Button']['.active'].backgroundColor = 'transparent';

// eslint-disable-next-line
const Navigator = Actions.create(
  <Lightbox>
    <Modal hideNavBar>
      <Scene key="root" hideNavBar>
        {/* <Drawer key="side_menu" contentComponent={SideBar}> */}
        <Scene hideNavBar panHandlers={null} drawerLockMode="locked-closed">
          <Scene key="splash" component={Splash} hideNavBar initial />
          <Scene key="about_act" component={InfoAct} />
          <Scene key="about_app" component={AboutApp} />
          <Scene key="about_volume" component={VolumeInfo} />
          <Scene key="activity_details" component={ActivityDetails} />
          <Scene key="applet_details" component={AppletDetails} />
          <Scene key="applet_list" component={AppletList} />
          <Scene key="consent" component={Consent} />
          <Scene key="logout_warning" component={LogoutWarning} />
          <Scene key="forgot_password" component={ForgotPassword} />
          <Scene key="login" component={Login} />
          <Scene key="settings" component={Settings} />
          <Scene key="change_password" component={ChangePassword} />
          <Scene key="applet_settings" component={AppletSettings} />
        </Scene>
        {/* </Drawer> */}
      </Scene>
      <Scene key="take_act" component={Activity} />
      <Scene key="invite" component={AppletInviteFlow} />
      <Scene key="activity_thanks" component={ActivityThanks} />
    </Modal>
  </Lightbox>
  ,
);

class AppNavigator extends Component {
  componentDidMount() {
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      Actions.pop();
      return true;
    });
  }


  componentWillUnmount() {
    this.backHandler.remove();
  }

  render() {
    return (
      <StyleProvider style={theme}>
        <Router navigator={Navigator} />
      </StyleProvider>
    );
  }
}


export default AppNavigator;
