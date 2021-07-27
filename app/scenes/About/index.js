import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StatusBar, TouchableOpacity } from 'react-native';
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
import i18n from 'i18next';
import styles from './styles';
import { appletsSelector } from '../../state/applets/applets.selectors';
import { skinSelector } from '../../state/app/app.selectors';
import BaseText from '../../components/base_text/base_text';

class AboutScreen extends Component {
  // eslint-disable-line
  openAboutApp = () => {
    Actions.push('about_app');
  };

  openAboutInfo = (info) => {
    Actions.push('about_volume', { activity: info });
  };

  renderVolumeInfo = (appletWithInfo) => {
    return (
      <TouchableOpacity
        key={appletWithInfo._id}
        style={styles.aboutLink}
        onPress={() => this.openAboutInfo(appletWithInfo.info)}
      >
        <Icon name="information-circle" style={styles.aboutIcon} />
        <BaseText numberOfLines={3} style={styles.buttonText}>
          `{i18n.t('about:about')} {appletWithInfo.name}`
        </BaseText>
      </TouchableOpacity>
    );
  };

  render() {
    const { applets, skin } = this.props;
    const appletsWithInfo = applets.filter(applet => typeof applet.info !== 'undefined');
    return (
      <Container style={styles.container}>
        <StatusBar barStyle="dark-content" />
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
              {appletsWithInfo > 0 ? (
                <BaseText textKey="about:applets_title" />
              ) : (
                <BaseText textKey="about:data_title" />
              )}
            </View>
            <View style={styles.buttons}>
              {appletsWithInfo.map(this.renderVolumeInfo)}
              <TouchableOpacity style={styles.aboutLink} onPress={this.openAboutApp}>
                <Icon
                  name="information-circle"
                  style={[styles.aboutIcon, { color: skin.colors.primary }]}
                />
                <BaseText
                  style={[styles.buttonText, { color: skin.colors.primary }]}
                  textKey="about:about_mindLogger"
                />
              </TouchableOpacity>
              <BaseText textKey="about:icons_title" />
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
