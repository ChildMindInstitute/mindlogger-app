import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {StatusBar, Image, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import {Container, Content, Button, H3, Text, Icon, View, Header, Right, Body, Title, Left, Toast} from 'native-base';
import {Actions} from 'react-native-router-flux';
import styles from './styles';
import { appletsSelector } from '../../state/applets/applets.selectors';

const logoImage = require('../../../img/color_logo.png');

const text = "This app is part of the Mindlogger data collection and analysis platform designed by the MATTER Lab at the Child Mind Institute (matter.childmind.org). While the app can easily be configured for many different uses, we designed it with the specific application of assessing mental health and cognitive abilities in mind. It can collect data in a variety of ways, from conventional surveys to audio, touch screen, and movement recordings. There are three ways to interact with Mindlogger: as an administrator, a user, or a viewer. An administrator logs into a website, and selects or creates activities to build a version of the app. Users log in to that version of the app and perform those activities. Viewers are given permission to view data for specific users on an online dashboard. We hope that you find Mindlogger to be useful! For more information, please visit matter.childmind.org. Cheers, Arno Klein"

class AboutScreen extends Component { // eslint-disable-line
    openAboutApp = () => {
      Actions.push('about_app');
    }

  openAboutInfo = (info) => {
    Actions.push('about_volume', { activity: info });
  }

    renderVolumeInfo = (appletWithInfo) => {
      return (
        <TouchableOpacity
          key={appletWithInfo._id}
          style={styles.aboutLink}
          onPress={() => this.openAboutInfo(appletWithInfo.info)}
        >
          <Icon name="information-circle" style={styles.aboutIcon} />
          <Text numberOfLines={3} style={styles.buttonText}>About {appletWithInfo.name}</Text>
        </TouchableOpacity>
      );
    }

    render() {
      const { applets } = this.props;
      const appletsWithInfo = applets.filter(applet => typeof applet.info !== 'undefined');
      return (
        <Container style={styles.container}>
          <StatusBar barStyle='light-content'/>
          <Header>
            <Left />
            <Body>
                <Title>About</Title>
            </Body>
            <Right>
              <Button transparent onPress={Actions.drawerOpen}>
                <Icon name="menu" />
              </Button>
            </Right>
          </Header>
          <Content style={styles.content}>
            <View>
              <View style={styles.headerText}>
                {appletsWithInfo > 0
                  ? <Text>Find out more about each of your Activity Sets and about the Mindlogger platform.</Text>
                  : <Text>Find out more about the Mindlogger data collection and analysis platform by tapping "About Mindlogger" below.</Text>
                }
              </View>
              <View style={styles.buttons}>
                {appletsWithInfo.map(this.renderVolumeInfo)}
                <TouchableOpacity style={styles.aboutLink} onPress={this.openAboutApp}>
                  <Icon name="information-circle" style={styles.aboutIcon}/>
                  <Text style={styles.buttonText}>About Mindlogger</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Content>
        </Container>
      );
    }
}

const mapStateToProps = state => ({
  applets: appletsSelector(state),
  themeState: state.drawer.themeState,
});

export default connect(mapStateToProps)(AboutScreen);
