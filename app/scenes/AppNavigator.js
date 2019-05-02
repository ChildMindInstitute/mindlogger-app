
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { BackHandler, StatusBar, Platform } from 'react-native';
import { connect } from 'react-redux';
import { StyleProvider, Drawer } from 'native-base';
import { Router, Scene, Lightbox, Actions, Stack } from 'react-native-router-flux';

import getTheme from '../../native-base-theme/components';
import material from '../../native-base-theme/variables/material';
import { closeDrawer } from '../state/drawer/drawer.actions';
import { colors } from '../theme';

// Scenes
import About from './About';
import AboutApp from './AboutApp';
import Activity from './Activity';
import ActivityList from './ActivityList';
import ChangeStudy from './ChangeStudy';
import Consent from './Consent';
import ForgotPassword from './ForgotPassword';
import InfoAct from './InfoAct';
import Login from './Login';
import LogoutWarning from './LogoutWarning';
import Settings from './Settings';
import SideBar from './Sidebar';
import Signup from './Signup';
import Splash from './Splash';
import VolumeInfo from './VolumeInfo';
import AppletList from './AppletList';

const Navigator = Actions.create(
  <Lightbox>
    <Stack key="root" hideNavBar>
      <Scene key="splash" component={Splash} initial />
      <Scene key="about_act" component={InfoAct} />
      <Scene key="about_app" component={AboutApp} />
      <Scene key="about_volume" component={VolumeInfo} />
      <Scene key="about" component={About} />
      <Scene key="activity" component={ActivityList} />
      <Scene key="applet_list" component={AppletList} />
      <Scene key="change_study" component={ChangeStudy} />
      <Scene key="consent" component={Consent} />
      <Scene key="forgot_password" component={ForgotPassword} />
      <Scene key="login" component={Login} />
      <Scene key="settings" component={Settings} />
      <Scene key="sign_up" component={Signup} />
      <Scene key="take_act" component={Activity} />
    </Stack>
    <Scene key="logout_warning" component={LogoutWarning} />
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

  componentDidUpdate(prevProps) {
    if (prevProps.drawerState === 'closed' && this.props.drawerState === 'opened') {
      this._drawer._root.open();
    }

    if (prevProps.drawerState === 'opened' && this.props.drawerState === 'closed') {
      this._drawer._root.close();
    }
  }

  render() {
    return (
      <StyleProvider style={getTheme((this.props.themeState === 'material') ? material : undefined)}>
        <Drawer
          ref={(ref) => { this._drawer = ref; }}
          content={<SideBar />}
          onClose={() => this.props.closeDrawer()}
        >
          <StatusBar
            hidden={this.props.drawerState === 'opened' && Platform.OS === 'ios'}
            backgroundColor={colors.primary}
            barStyle="light-content"
          />
          <Router navigator={Navigator} />
        </Drawer>
      </StyleProvider>
    );
  }
}

AppNavigator.propTypes = {
  drawerState: PropTypes.string.isRequired,
  closeDrawer: PropTypes.func.isRequired,
  themeState: PropTypes.string.isRequired,
};

const bindAction = dispatch => ({
  closeDrawer: () => dispatch(closeDrawer()),
});

const mapStateToProps = state => ({
  themeState: state.drawer.themeState,
  drawerState: state.drawer.drawerState,
});

export default connect(mapStateToProps, bindAction)(AppNavigator);
