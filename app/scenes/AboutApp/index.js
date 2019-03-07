import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {StatusBar, Image} from 'react-native';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';
import {Container, Content, Button, H3, Text, Icon, View, Header, Right, Body, Title, Left} from 'native-base';
import {Actions} from 'react-native-router-flux';

import { openDrawer } from '../../state/drawer/drawer.actions';
import styles from './styles';
import packageJson from '../../../package.json';

const logoImage = require('../../../img/color_logo.png');

const text = "This app is part of the Mindlogger data collection and analysis platform designed by the MATTER Lab at the Child Mind Institute (matter.childmind.org). While the app can easily be configured for many different uses, we designed it with the specific application of assessing mental health and cognitive abilities in mind. It can collect data in a variety of ways, from conventional surveys to audio, touch screen, and movement recordings. There are three ways to interact with Mindlogger: as an administrator, a user, or a viewer. An administrator logs into a website, and selects or creates activities to build a version of the app. Users log in to that version of the app and perform those activities. Viewers are given permission to view data for specific users on an online dashboard. We hope that you find Mindlogger to be useful! For more information, please visit matter.childmind.org. Cheers, Arno Klein";

class AboutApp extends Component { // eslint-disable-line
    componentWillMount() {

    }

    onClose = () => {
      Actions.pop();
    }

    render() {
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
                  <Title>About Mindlogger {packageJson.version}</Title>
              </Body>
              <Right></Right>
            </Header>
            <Content>
              <View style={styles.content}>
                <Text style={styles.text}>
                  This app is part of the Mindlogger data collection and analysis platform designed by the MATTER Lab at the Child Mind Institute (matter.childmind.org).
                  {"\n"}
                </Text>
                <Text style={styles.boldText}>What is Mindlogger?</Text>
                <Text style={styles.text}>
                  Mindlogger is a general-purpose data collection platform:

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
                <Text style={styles.boldText}>What can Mindlogger do?</Text>
                <Text style={styles.text}>
                  Mindlogger's feature set is growing, and currently supports a wide variety of survey types, voice recording, and drawing and photo annotation capabilities.
                  {"\n"}
                </Text>
                <Text style={styles.boldText}>Who uses Mindlogger?</Text>
                <Text style={styles.text}>
                  Mindlogger is being used to gather data in large-scale research studies, in the clinic for remote mental health assessment, and by others interested in collecting and analyzing data from themselves or from other people.
                  {"\n"}
                  {"\n"}

                  We hope that you find Mindlogger to be useful! For more information, please visit matter.childmind.org.
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

function bindActions(dispatch) {
    return bindActionCreators({openDrawer}, dispatch)
}

const mapStateToProps = state => ({
  themeState: state.drawer.themeState, routes: state.drawer.routes
});

export default connect(mapStateToProps, bindActions)(AboutApp);
