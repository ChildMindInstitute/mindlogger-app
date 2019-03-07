
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { BackHandler, StatusBar, Platform } from 'react-native';
import { connect } from 'react-redux';
import { StyleProvider, Drawer } from 'native-base';
import { Router, Scene, Actions } from 'react-native-router-flux';

import getTheme from '../../native-base-theme/components';
import material from '../../native-base-theme/variables/material';
import { closeDrawer } from '../actions/drawer';
import statusBarColor from '../themes/variables';
import DrawerCheck from '../DrawerCheck';

// Scenes
import SideBar from './Sidebar';
import ActivityList from './ActivityList';
import Login from './Login';
import ForgotPassword from './ForgotPassword';
import Consent from './Consent';
import Signup from './Signup';
import Settings from './Settings';
import About from './About';
import AboutApp from './AboutApp';
import FrequencyScreen from './Frequency';
import Activity from './Activity';
import PushAct from './PushAct';
import InfoAct from './InfoAct';
import VolumeInfo from './VolumeInfo';

const RouterWithRedux = connect()(Router);

class AppNavigator extends Component {
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', () => {
      Actions.pop();
      return true;
    });
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

  popRoute = () => {
    Actions.pop();
  }

  render() {
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
              <Scene key="login" component={Login} initial />
              <Scene key="about" component={About} />
              <Scene key="consent" component={Consent} />
              <Scene key="sign_up" component={Signup} />
              <Scene key="forgot_password" component={ForgotPassword} />
              <Scene key="settings" component={Settings} />
              <Scene key="activity" component={ActivityList} />
              <Scene key="frequency" component={FrequencyScreen} />
              <Scene key="push_act" component={PushAct} />
              <Scene key="take_act" component={Activity} />
              <Scene key="about_act" component={InfoAct} />
              <Scene key="about_volume" component={VolumeInfo} />
              <Scene key="about_app" component={AboutApp} />
            </Scene>
          </RouterWithRedux>
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
  popRoute: key => dispatch(popRoute(key)),
});

const mapStateToProps = state => ({
  
  themeState: state.drawer.themeState,
});

export default connect(mapStateToProps, bindAction)(AppNavigator);
