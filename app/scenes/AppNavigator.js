
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
import SideBar from './Sidebar';
import ActivityList from './ActivityList';
import Login from './Login';
import ChangeStudy from './ChangeStudy';
import ForgotPassword from './ForgotPassword';
import Consent from './Consent';
import Signup from './Signup';
import Settings from './Settings';
import About from './About';
import AboutApp from './AboutApp';
// import FrequencyScreen from './Frequency';
import Activity from './Activity';
// import PushAct from './PushAct';
import InfoAct from './InfoAct';
import VolumeInfo from './VolumeInfo';
import Splash from './Splash';
import LogoutWarning from './LogoutWarning';

const Navigator = Actions.create(
  <Lightbox>
    <Stack key="root" hideNavBar>
      <Scene key="splash" component={Splash} initial />
      <Scene key="login" component={Login} />
      <Scene key="about" component={About} />
      <Scene key="consent" component={Consent} />
      <Scene key="sign_up" component={Signup} />
      <Scene key="change_study" component={ChangeStudy} />
      <Scene key="forgot_password" component={ForgotPassword} />
      <Scene key="settings" component={Settings} />
      <Scene key="activity" component={ActivityList} />
      {/* <Scene key="frequency" component={FrequencyScreen} /> */}
      {/* <Scene key="push_act" component={PushAct} /> */}
      <Scene key="take_act" component={Activity} />
      <Scene key="about_act" component={InfoAct} />
      <Scene key="about_volume" component={VolumeInfo} />
      <Scene key="about_app" component={AboutApp} />
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
