
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

class AboutScreen extends Component { // eslint-disable-line
    componentWillMount() {

    }

    openAboutInfo(info){
      const {actData} = this.props;
      const {variant} = actData[info._id];
      
      Actions.push('about_volume', {act:variant});
    }

    openAboutApp = () => {
      Actions.push('about_app');
    }

    render() {
      const {acts, volumes} = this.props;
      let info = acts.find(act => act.meta && act.meta.info)
      let volume = volumes[0];
      return (
        <Container style={styles.container}>
          <StatusBar barStyle='light-content'/>
          <Header>
            <Left>
                <Button transparent onPress={this.props.openDrawer}>
                <Icon name="close" />
                </Button>
            </Left>
            <Body>
                <Title>About</Title>
            </Body>
            <Right></Right>
          </Header>
          <View style={{flex:1}}>
            <View style={styles.buttons}>
              {volume && info && <Button transparent onPress={() => this.openAboutInfo(info)}><Icon name="information-circle" /><Text>About {volume.name}</Text></Button>}
              <Button transparent onPress={this.openAboutApp}><Icon name="information-circle" /><Text>About app</Text></Button>
            </View>
          </View>
        </Container>
      );
    }
}

function bindActions(dispatch) {
    return bindActionCreators({openDrawer}, dispatch)
}

const mapStateToProps = state => ({
  volumes: state.core.volumes,
  actData: state.core.actData || {},
  acts: state.core.folder.infoActs || [],
  themeState: state.drawer.themeState, routes: state.drawer.routes
});

export default connect(mapStateToProps, bindActions)(AboutScreen);
