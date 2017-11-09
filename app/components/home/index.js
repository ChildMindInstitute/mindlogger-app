import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ImageBackground, Image, View, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import { Container, Button, H3, Text } from 'native-base';
import { Actions } from 'react-native-router-flux';

import { openDrawer } from '../../actions/drawer';
import styles from './styles';

const launchscreenBg = require('../../../img/launchscreen-bg.png');
const launchscreenLogo = require('../../../img/CMI_white_h_logo.png');

class Home extends Component { // eslint-disable-line

  static propTypes = {
    openDrawer: PropTypes.func,
  }

  render() {
    return (
      <Container>
        <StatusBar barStyle='light-content'/>
        <ImageBackground source={launchscreenBg} style={styles.imageContainer}>
          <View style={styles.logoContainer}>
            <Image source={launchscreenLogo} style={styles.logo} />
          </View>
          <View style={{ alignItems: 'center', marginBottom: 50, backgroundColor: 'transparent' }}>
            <H3 style={styles.text}></H3>
            <View style={{ marginTop: 8 }} />
            <H3 style={styles.text}>Login to start</H3>
          </View>
          <View style={{ marginBottom: 80, flexDirection: 'column' }}>
            <Button
              style={styles.login}
              onPress={() => Actions.login()}
            >
              <Text>Login</Text>
            </Button>
            <Button
            style={styles.signup}
            onPress={() => Actions.sign_up()}
            >
            <Text>Signup</Text>
            </Button>
          </View>
        </ImageBackground>
      </Container>
    );
  }
}

function bindActions(dispatch) {
  return {
    openDrawer: () => dispatch(openDrawer()),
  };
}

const mapStateToProps = state => ({
  navigation: state.cardNavigation,
  themeState: state.drawer.themeState,
  routes: state.drawer.routes,
});

export default connect(mapStateToProps, bindActions)(Home);
