import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {StatusBar, Image } from 'react-native';
import { connect } from 'react-redux';
import { Container, Content, Button, Text, Icon, View, Header, Right, Body, Title, Left } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { MarkdownView } from 'react-native-markdown-view';
import styles from './styles';
import packageJson from '../../../package.json';
import { skinSelector } from '../../state/app/app.selectors';
import { markdownStyle } from '../../themes/activityTheme';

const logoImage = require('../../../img/color_logo.png');

const mindloggerAbout = 'This app is part of the MindLogger data collection and analysis platform designed by the MATTER Lab at the Child Mind Institute (matter.childmind.org).\n\n### What is MindLogger?\n\nMindLogger is a general-purpose data collection platform:\n\n * App builder → Build iPhone/Android apps online without coding!\n * Mobile apps → Collect data remotely!\n * Database and analytics → Securely store and analyze data in the cloud!\n * Online dashboard → View analyzed data online!\n\n### What can MindLogger do?\n\nMindLogger\'s feature set is growing, and currently supports a wide variety of survey types, voice recording, and drawing and photo annotation capabilities.\n\n### Who uses MindLogger?\n\nMindLogger is being used to gather data in large-scale research studies, in the clinic for remote mental health assessment, and by others interested in collecting and analyzing data from themselves or from other people.\n\nWe hope that you find MindLogger to be useful! For more information, please visit matter.childmind.org.\n\nCheers,\nArno Klein';

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
                  <Title>{'About ' + title}</Title>
                </Body>
                <Right></Right>
              </Header>
              <Content>
                <View style={styles.content}>
                  <MarkdownView styles={markdownStyle}>{skin.about}</MarkdownView>
                </View>
              </Content>
            </Container>
          );
        }
      }
      return (
        <Container style={styles.container}>
          <StatusBar barStyle='light-content'/>
          <Header style={{ backgroundColor: skin.colors.primary }}>
            <Left>
              <Button transparent onPress={this.onClose}>
                <Icon name="close" />
              </Button>
            </Left>
            <Body>
              <Title>About MindLogger {packageJson.version}</Title>
            </Body>
            <Right></Right>
          </Header>
          <Content>
            <View style={styles.content}>
              <MarkdownView styles={markdownStyle}>
                {mindloggerAbout}
              </MarkdownView>
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
  skin: skinSelector(state)
});

export default connect(mapStateToProps, null)(AboutApp);
