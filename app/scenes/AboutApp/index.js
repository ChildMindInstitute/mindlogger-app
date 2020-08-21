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
### What is MindLogger?

This app is part of the open source MindLogger data collection and analysis platform designed by the MATTER Lab at the Child Mind Institute (https://matter.childmind.org).

### What can MindLogger do?

MindLogger's feature set is growing, and currently supports a wide variety of input types. Each screen in a MindLogger activity can include any of the following:
  - Text, picture, and audio
  - Question followed by image and/or text response options
  - Slider bar
  - Text entry
  - Table entry
  - Audio record
  - Photo/video capture
  - Drawing or tapping
  - Current geolocation
  - Simple cognitive task
  - Delay before response
  - Timer
  - Conditional logic to determine where to go next

### Where can I learn more?

Please visit https://mindlogger.org for more information.

Cheers,
MindLogger Team
Child Mind Institute`;

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
              <Header hasSubtitle style={{ backgroundColor: skin.colors.primary }}>
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
                    Unless stated elsewhere, icons are drawn from OpenMoji and NounProject.
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
          <Header hasSubtitle style={{ backgroundColor: skin.colors.primary, paddingTop: '3.5%' }}>
            <Left>
              <Button transparent onPress={this.onClose}>
                <Icon name="close" />
              </Button>
            </Left>
            <Body style={{ paddingTop: 10 }}>
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
                  Unless stated elsewhere, icons are drawn from OpenMoji and NounProject.
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
