import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {StatusBar, Image} from 'react-native';
import { connect } from 'react-redux';
import {Container, Content, Button, H3, Text, Icon, View, Header, Right, Body, Title, Left} from 'native-base';
import {Actions} from 'react-native-router-flux';
import styles from './styles';
import packageJson from '../../../package.json';
import { skinSelector } from '../../state/app/app.selectors';

const logoImage = require('../../../img/color_logo.png');

class AboutApp extends Component { // eslint-disable-line

    onClose = () => {
      Actions.pop();
    }

    render() {
        const { skin } = this.props;
        const title = skin ? skin.name : 'MindLogger';
        if (typeof skin.about !== 'undefined') {
          return (
            <Container style={styles.container}>
              <StatusBar barStyle='light-content'/>
              <Header>
                <Left>
                  <Button transparent onPress={this.onClose}>
                    <Icon
                      ios="ios-arrow-back"
                      android="md-arrow-back"
                    />
                  </Button>
                </Left>
                <Body>
                    <Title>{'About '+title}</Title>
                </Body>
                <Right></Right>
              </Header>
              <Content>
                <View style={styles.content}>
                  <Text style={styles.text}>{skin.about}</Text>
                </View>
              </Content>
            </Container>
          );
        } else {
          return (
            <Container style={styles.container}>
              <StatusBar barStyle='light-content'/>
              <Header>
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
                  <Text style={styles.text}>
                    This app is part of the MindLogger data collection and analysis platform designed by the MATTER Lab at the Child Mind Institute (matter.childmind.org).
                    {"\n"}
                  </Text>
                  <Text style={styles.boldText}>What is MindLogger?</Text>
                  <Text style={styles.text}>
                    MindLogger is a general-purpose data collection platform:

                    {"\n"}
                    - App builder → Build iPhone/Android apps online without coding!
                    {"\n"}
                    - Mobile apps → Collect data remotely!
                    {"\n"}
                    - Database and analytics → Securely store and analyze data in the cloud!
                    {"\n"}
                    - Online dashboard → View analyzed data online!
                    {"\n"}
                  </Text>
                  <Text style={styles.boldText}>What can MindLogger do?</Text>
                  <Text style={styles.text}>
                    MindLogger's feature set is growing, and currently supports a wide variety of survey types, voice recording, and drawing and photo annotation capabilities.
                    {"\n"}
                  </Text>
                  <Text style={styles.boldText}>Who uses MindLogger?</Text>
                  <Text style={styles.text}>
                    MindLogger is being used to gather data in large-scale research studies, in the clinic for remote mental health assessment, and by others interested in collecting and analyzing data from themselves or from other people.
                    {"\n"}
                    {"\n"}

                    We hope that you find MindLogger to be useful! For more information, please visit matter.childmind.org.
                    {"\n"}
                    {"\n"}
                    Cheers,
                    {"\n"}
                    Arno Klein
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
}

const mapStateToProps = state => ({
  skin: skinSelector(state)
});

export default connect(mapStateToProps, null)(AboutApp);
