import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StatusBar, Image, Text, Platform } from 'react-native';
import { connect } from 'react-redux';
import {
  Container,
  Content,
  Button,
  Icon,
  View,
  Header,
  Right,
  Body,
  Title,
  Left,
} from 'native-base';
import { Actions } from 'react-native-router-flux';
import styles from './styles';
import packageJson from '../../../package.json';
import { skinSelector } from '../../state/app/app.selectors';
import { Markdown } from '../../components/core';
import BaseText from '../../components/base_text/base_text';
import i18n from '../../i18n/i18n';

const logoImage = require('../../../img/color_logo.png');

const IOSHeaderPadding = Platform.OS === 'ios' ? '3.5%' : 0;
const IOSBodyPadding = Platform.OS === 'ios' ? 10 : 0;

class AboutApp extends Component {
  // eslint-disable-line

  onClose = () => {
    Actions.pop();
  };

  render() {
    const { skin } = this.props;
    const title = skin ? skin.name : 'MindLogger';
    const mindloggerAbout = i18n.t('about_app:mindlogger_about');
    if (typeof skin.about === 'string') {
      if (skin.about.replace(/\s/g, '').length) {
        return (
          <Container style={styles.container}>
            <StatusBar barStyle="light-content" />
            <Header hasSubtitle style={{ backgroundColor: skin.colors.primary }}>
              <Left>
                <Button transparent onPress={this.onClose}>
                  <Icon ios="ios-arrow-back" android="md-arrow-back" />
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
                <BaseText textKey="about_app:title" />
              </View>
            </Content>
          </Container>
        );
      }
    }
    return (
      <Container style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Header
          hasSubtitle
          style={{
            backgroundColor: skin.colors.primary,
            paddingTop: IOSHeaderPadding,
          }}
        >
          <Left>
            <Button transparent onPress={this.onClose}>
              <Icon name="close" />
            </Button>
          </Left>
          <Body style={{ paddingTop: IOSBodyPadding }}>
            <Title>
              {mindloggerAbout} {packageJson.version}
            </Title>
          </Body>
          <Right />
        </Header>
        <Content>
          <View style={styles.content}>
            <Markdown>{mindloggerAbout}</Markdown>
            <BaseText textKey="about_app:subtitle" />
            <View>
              <Image square style={styles.logo} source={logoImage} />
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

export default connect(
  mapStateToProps,
  null,
)(AboutApp);
