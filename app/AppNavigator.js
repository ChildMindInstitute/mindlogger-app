
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { BackHandler, StatusBar, NavigationCardStack, Platform } from 'react-native';
import { connect } from 'react-redux';
import { Root, StyleProvider, variables, Drawer } from 'native-base';
import { actions } from 'react-native-navigation-redux-helpers';
import { Router, Scene } from 'react-native-router-flux';

import getTheme from '../native-base-theme/components';
import material from '../native-base-theme/variables/material';
import { closeDrawer } from './actions/drawer';

// Main Screens
import Home from './components/home/';
import SplashPage from './components/splashscreen/';
import SideBar from './components/sidebar';
import ActivityScreen from './containers/activity/';

//Modules

import SurveyApp from './modules/survey';


import statusBarColor from './themes/variables';

const {
  popRoute,
} = actions;

const RouterWithRedux = connect()(Router);

class AppNavigator extends Component {

  static propTypes = {
    drawerState: PropTypes.string,
    popRoute: PropTypes.func,
    closeDrawer: PropTypes.func,
    themeState: PropTypes.string,
    navigation: PropTypes.shape({
      key: PropTypes.string,
      routes: PropTypes.array,
    }),
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', () => {
      const routes = this.props.navigation.routes;

      if (routes[routes.length - 1].key === 'home') {
        return false;
      }

      this.props.popRoute(this.props.navigation.key);
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
    this.props.popRoute();
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
      <Root>
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
              <Scene key="home" component={Home} initial={true} />
              <Scene key="activity" component={ActivityScreen} />
              {SurveyApp}
            </Scene>
          </RouterWithRedux>
        </Drawer>
      </StyleProvider>
      </Root>
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
  navigation: state.cardNavigation,
});

export default connect(mapStateToProps, bindAction)(AppNavigator);
