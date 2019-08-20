import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StatusBar, Image, Text } from 'react-native';
import { connect } from 'react-redux';
import { Container, Content, Button, Icon, View, Header, Right, Body, Title, Left } from 'native-base';
import { Actions } from 'react-native-router-flux';
import styles from './styles';
import packageJson from '../../../package.json';
import { skinSelector } from '../../state/app/app.selectors';
import { Markdown } from '../../components/core';

const logoImage = require('../../../img/color_logo.png');

const mindloggerAbout = `
This app is part of the MindLogger data collection and analysis
platform designed by the MATTER Lab at the Child Mind Institute (matter.childmind.org).


### What is MindLogger?

MindLogger is a general-purpose data collection platform:
* App builder → Build iPhone/Android apps online without coding!
* Mobile apps → Collect data remotely!
* Database and analytics → Securely store and analyze data in the cloud!
* Online dashboard → View analyzed data online!

### What can MindLogger do?

MindLogger's feature set is growing,
and currently supports a wide variety of survey types, voice recording,
and drawing and photo annotation capabilities.

### Who uses MindLogger?

MindLogger is being used to gather data in large-scale research studies,
in the clinic for remote mental health assessment, and by others interested
in collecting and analyzing data from themselves or from other people.\n\n
We hope that you find MindLogger to be useful! For more information,
please visit matter.childmind.org.

Cheers,
MindLogger Team @ the Child Mind Institute`;

class AboutApp extends Component { // eslint-disable-line

    onClose = () => {
      Actions.pop();
    }

    render() {
      const { skin } = this.props;
      const title = skin ? skin.name : 'MindLogger';
      if (typeof skin.about === 'string') {
        if (skin.about.replace(/\s/g, '').length) {
          return (
            <Container style={styles.container}>
              <StatusBar barStyle="light-content" />
              <Header style={{ backgroundColor: skin.colors.primary }}>
                <Left>
                  <Button transparent onPress={this.onClose}>
                    <Icon
                      ios="ios-arrow-back"
                      android="md-arrow-back"
                    />
                  </Button>
                </Left>
                <Body>
                  <Title>About {title}</Title>
                </Body>
                <Right />
              </Header>
              <Content>
                <View style={styles.content}>
                  <Markdown>{skin.about}</Markdown>
                  <Text>
                    NounProject icons were created by Alina Oleynik (survey),
                    beth bolton (book), and Shakeel (chart)
                  </Text>
                </View>
              </Content>
            </Container>
          );
        }
      }
      return (
        <Container style={styles.container}>
          <StatusBar barStyle="light-content" />
          <Header style={{ backgroundColor: skin.colors.primary }}>
            <Left>
              <Button transparent onPress={this.onClose}>
                <Icon name="close" />
              </Button>
            </Left>
            <Body>
              <Title>About MindLogger {packageJson.version}</Title>
            </Body>
            <Right />
          </Header>
          <Content>
            <View style={styles.content}>
              <Markdown>
                {mindloggerAbout}
              </Markdown>
              <Text>
                  NounProject icons were created by Alina Oleynik (survey),
                  beth bolton (book), and Shakeel (chart)
              </Text>
              <View>
                <Image
                  square
                  style={styles.logo}
                  source={logoImage}
                />
              </View>
            </View>
          </Content>
        </Container>
      );
    }
}

AboutApp.propTypes = {
  skin: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  skin: skinSelector(state),
});

export default connect(mapStateToProps, null)(AboutApp);
