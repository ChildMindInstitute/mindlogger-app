import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StatusBar, Image, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { Container, Content, Button, H3, Text, Icon, View, Header, Right, Body, Title, Left, Toast } from 'native-base';
import { Actions } from 'react-native-router-flux';
import styles from './styles';
import { appletsSelector } from '../../state/applets/applets.selectors';
import { skinSelector } from '../../state/app/app.selectors';


const logoImage = require('../../../img/color_logo.png');

const text = 'This app is part of the MindLogger data collection platform created by the MATTER Lab at the Child Mind Institute (matter.childmind.org). While the app can easily be configured for many different uses, we designed it with the specific application of assessing mental health and cognitive abilities in mind. It can collect data in a variety of ways, including checkboxes, sliders, text entry, audio and camera recording, and drawing. A manager logs into a website and selects or creates activities to build an applet. Users log in to the app and perform those activities. Reviewers are given permission to view data for specific users. We hope that you find MindLogger to be useful! For more information, please visit matter.childmind.org. Cheers, MATTER Lab team';

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
      const { applets, skin } = this.props;
      const appletsWithInfo = applets.filter(applet => typeof applet.info !== 'undefined');
      return (
        <Container style={styles.container}>
          <StatusBar barStyle="light-content" />
          <Header style={{ backgroundColor: skin.colors.primary }}>
            <Left />
            <Body>
              <Title>About</Title>
            </Body>
            <Right>
              <Button transparent onPress={Actions.drawerOpen}>
                <Icon type="FontAwesome" name="bars" />
              </Button>
            </Right>
          </Header>
          <Content style={styles.content}>
            <View>
              <View style={styles.headerText}>
                {appletsWithInfo > 0
                  ? <Text>Find out more about each of your applets and about the MindLogger platform.</Text>
                  : <Text>Find out more about the MindLogger data collection platform by tapping "About MindLogger" below.</Text>
                }
              </View>
              <View style={styles.buttons}>
                {appletsWithInfo.map(this.renderVolumeInfo)}
                <TouchableOpacity style={styles.aboutLink} onPress={this.openAboutApp}>
                  <Icon name="information-circle" style={[styles.aboutIcon, { color: skin.colors.primary }]} />
                  <Text style={[styles.buttonText, { color: skin.colors.primary }]}>About MindLogger</Text>
                </TouchableOpacity>
                <Text>
                  NounProject icons were created by Alina Oleynik (survey), beth bolton (book), and Shakeel (chart)
                </Text>
              </View>
            </View>
          </Content>
        </Container>
      );
    }
}

AboutScreen.propTypes = {
  applets: PropTypes.array.isRequired,
  skin: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  applets: appletsSelector(state),
  skin: skinSelector(state),
});

export default connect(mapStateToProps)(AboutScreen);
