import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {StatusBar, Image, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';
import {Container, Content, Button, H3, Text, Icon, View, Header, Right, Body, Title, Left, Toast} from 'native-base';
import {Actions} from 'react-native-router-flux';

import { openDrawer } from '../../state/drawer/drawer.actions';
import styles from './styles';

const logoImage = require('../../../img/color_logo.png');

const text = "This app is part of the Mindlogger data collection and analysis platform designed by the MATTER Lab at the Child Mind Institute (matter.childmind.org). While the app can easily be configured for many different uses, we designed it with the specific application of assessing mental health and cognitive abilities in mind. It can collect data in a variety of ways, from conventional surveys to audio, touch screen, and movement recordings. There are three ways to interact with Mindlogger: as an administrator, a user, or a viewer. An administrator logs into a website, and selects or creates activities to build a version of the app. Users log in to that version of the app and perform those activities. Viewers are given permission to view data for specific users on an online dashboard. We hope that you find Mindlogger to be useful! For more information, please visit matter.childmind.org. Cheers, Arno Klein"

class AboutScreen extends Component { // eslint-disable-line
    componentWillMount() {

    }

    openAboutInfo(info){
      if(info == undefined)
      {
        Toast.show({text: 'No information screen', position: 'bottom', type: 'info', buttonText: 'OK'})
        return;
      }
      const {actData} = this.props;
      const {variant} = actData[info._id];
      
      Actions.push('about_volume', {act:variant});
    }

    openAboutApp = () => {
      Actions.push('about_app');
    }
    renderVolumeInfo = (volume) => {
      const info = volume.infoActs && volume.infoActs.find(act => act.meta && act.meta.info)
      return (<TouchableOpacity
        key={volume._id}
        style={styles.aboutLink}
        onPress={() => this.openAboutInfo(info)}>
        <Icon name="information-circle" style={styles.aboutIcon} />
        <Text numberOfLines={3} style={styles.buttonText}>About {volume.name}</Text>
        </TouchableOpacity>)

    }
    render() {
      const {volumes} = this.props;
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
          <Content style={styles.content}>
            <View>
              <View style={styles.headerText}>
              {volumes && volumes.length>0 ?
                <Text>Find out more about each of your Activity Sets and about the Mindlogger platform.</Text>
                :
                <Text>You aren't currently enrolled in any Activities. Find out more about the Mindlogger data collection and analysis platform by tapping "About Mindlogger" below</Text>
              }
              </View>
              <View style={styles.buttons}>
                {
                  volumes && volumes.map(this.renderVolumeInfo)
                }
                <TouchableOpacity style={styles.aboutLink} onPress={this.openAboutApp}>
                  <Icon name="information-circle" style={styles.aboutIcon}/>
                  <Text style={styles.buttonText}>About Mindlogger</Text>
                </TouchableOpacity>
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
  volumes: state.core.volumes,
  actData: state.core.actData || {},
  themeState: state.drawer.themeState, routes: state.drawer.routes
});

export default connect(mapStateToProps, bindActions)(AboutScreen);
