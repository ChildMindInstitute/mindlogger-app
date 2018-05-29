
const text="This app is part of the Mindlogger data collection and analysis platform designed by the MATTER Lab at the Child Mind Institute (matter.childmind.org). While the app can easily be configured for many different uses, we designed it with the specific application of assessing mental health and cognitive abilities in mind. It can collect data in a variety of ways, from conventional surveys to audio, touch screen, and movement recordings. There are three ways to interact with Mindlogger: as an administrator, a user, or a viewer. An administrator logs into a website, and selects or creates activities to build a version of the app. Users log in to that version of the app and perform those activities. Viewers are given permission to view data for specific users on an online dashboard. We hope that you find Mindlogger to be useful! For more information, please visit matter.childmind.org. Cheers, Arno Klein"

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {StatusBar, Image} from 'react-native';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';
import {Container, Content, Button, H3, Text, Icon, View, Header, Right, Body, Title, Left} from 'native-base';
import {Actions} from 'react-native-router-flux';

import { openDrawer } from '../../actions/drawer';
import styles from './styles';

const logoImage = require('../../../img/color_logo.png');

class AboutApp extends Component { // eslint-disable-line
    componentWillMount() {

    }

    render() {
        return (
          <Container style={styles.container}>
            <StatusBar barStyle='light-content'/>
            <Header>
              <Left>
                  <Button transparent onPress={this.props.openDrawer}>
                  <Icon name="menu" />
                  </Button>
              </Left>
              <Body>
                  <Title>MINDLOGGER</Title>
              </Body>
              <Right></Right>
            </Header>
            <Content>
              <View style={styles.content}>
                <Text style={styles.text}>
                  This app is part of the Mindlogger data collection and analysis platform designed by the MATTER Lab at the Child Mind Institute (matter.childmind.org).
                  {"\n"}
                  {"\n"}
                  While the app can easily be configured for many different uses, we designed it with the specific application of assessing mental health and cognitive abilities in mind.
                  {"\n"}
                  {"\n"}
                  It can collect data in a variety of ways, from conventional surveys to audio, touch screen, and movement recordings.
                  {"\n"}
                  {"\n"}
                  There are three ways to interact with Mindlogger: as an administrator, a user, or a viewer. An administrator logs into a website, and selects or creates activities to build a version of the app. Users log in to that version of the app and perform those activities. Viewers are given permission to view data for specific users on an online dashboard.
                  {"\n"}
                  {"\n"}
                  We hope that you find Mindlogger to be useful! For more information, please visit matter.childmind.org.
                  {"\n"}
                  {"\n"}
                  Cheers, Arno Klein
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

const mapStateToProps = state => ({themeState: state.drawer.themeState, routes: state.drawer.routes});

export default connect(mapStateToProps, bindActions)(AboutApp);
