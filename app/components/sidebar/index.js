
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ImageBackground, Image, Platform } from 'react-native';
import { connect } from 'react-redux';
import { Content, Text, List, ListItem, Icon, Container, Left, Right, Badge, Button, View, StyleProvider, getTheme, variables } from 'native-base';
import { Actions } from 'react-native-router-flux';

import material from '../../../native-base-theme/variables/material';
import { changePlatform, changeMaterial, closeDrawer } from '../../actions/drawer';
import navigateTo from '../../actions/sideBarNav';
import styles from './style';
import {logoutUser} from '../../actions/api';

const drawerCover = require('../../../img/drawer-cover.png');

const drawerImage = require('../../../img/CMI_white_logo.png');

const datas = [
  {
    name: 'Activities',
    route: 'activity',
    icon: 'phone-portrait',
    bg: '#C5F442',
  },
  {
    name: 'Dashboard',
    route: 'dashboard',
    icon: 'home',
    bg: '#477EEA',
  },
  {
    name: 'Settings',
    route: 'settings',
    icon: 'settings',
    bg: '#DA4437',
  },
  {
    name: 'About',
    route: 'about',
    icon: 'help-buoy',
    bg: '#4DCAE0',
  },
  {
    name: 'Logout',
    route: 'logout',
    icon: 'log-out',
    bg: '#1EBC7C',
  },
];
class SideBar extends Component {

  static propTypes = {
    navigateTo: PropTypes.func,
    themeState: PropTypes.string,
    changePlatform: PropTypes.func,
    changeMaterial: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {
      shadowOffsetWidth: 1,
      shadowRadius: 4,
    };
  }

  navigateTo(route) {
    this.props.navigateTo(route, 'home');
  }

  onMenu(route) {
    const {closeDrawer, logoutUser} = this.props;
    if(route == 'logout') {
      logoutUser();
      Actions.pop();
    } else {
      Actions.replace(route);
    }
    closeDrawer();
  }

  render() {
    return (
      <Container>
        <Content
          bounces={false}
          style={{ flex: 1, backgroundColor: '#fff', top: -1 }}
        >
          <ImageBackground source={drawerCover} style={styles.drawerCover}>
            <Image
              square
              style={styles.drawerImage}
              source={drawerImage}
            />
          </ImageBackground>
          <List
            dataArray={datas} renderRow={data =>
              <ListItem button noBorder onPress={() => this.onMenu(data.route)} >
                <Left>
                  <Icon active name={data.icon} style={{ color: '#777', fontSize: 26, width: 30 }} />
                  <Text style={styles.text}>{data.name}</Text>
                </Left>
                {(data.types) &&
                <Right style={{ flex: 1 }}>
                  <Badge
                    style={{ borderRadius: 3, height: 25, width: 72, backgroundColor: data.bg }}
                  >
                    <Text style={styles.badgeText}>{`${data.types} Types`}</Text>
                  </Badge>
                </Right>
                }
              </ListItem>}
          />

        </Content>
      </Container>
    );
  }
}

function bindAction(dispatch) {
  return {
    navigateTo: (route, homeRoute) => dispatch(navigateTo(route, homeRoute)),
    closeDrawer: () => dispatch(closeDrawer()),
    changePlatform: () => dispatch(changePlatform()),
    changeMaterial: () => dispatch(changeMaterial()),
    logoutUser: () => dispatch(logoutUser()),
  };
}

const mapStateToProps = state => ({
  navigation: state.cardNavigation,
  themeState: state.drawer.themeState,
});

export default connect(mapStateToProps, bindAction)(SideBar);
