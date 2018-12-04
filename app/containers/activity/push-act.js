
import React, { Component } from 'react';
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import { Container, Header, Title, Content, Button, Icon, Left, Body, Right, Toast, Spinner } from 'native-base';
import { Actions } from 'react-native-router-flux';

import { openDrawer, closeDrawer } from '../../actions/drawer';
import {
    setActivity,
    setVolume,
    setAnswer,
} from '../../actions/coreActions';

import {Platform} from 'react-native';

import styles from './styles';

class PushActivityScreen extends Component {

    componentWillMount() {
      const {notification} = this.props;
      this.setState({})
      if(Platform.OS == 'ios') {
        this.onNotificationIOS(notification);
      } else {
        this.onNotificationAndroid(notification);
      }
    }

    onNotificationIOS = (notification) => {
        let {data} = notification;
        if(data)
            this.startActivityFromNotification(data.actId)
        else
            Actions.pop();
    }

    onNotificationAndroid = (notification) => {
        const {data} = notification;
        if(data)
            this.startActivityFromNotification(data.actId)
        else
            Actions.pop();
    }

    startActivityFromNotification(actId){
        const {acts, actData, volumes} = this.props;
        const act = acts.find( a => a._id == actId )
        const volume = volumes.find(v => v._id == act.volumeId);
        if(volume && actData[actId]) {
            this.navigateToAct(volume, actData[actId], {
                notificationTime: Date.now()
            });
        } else {
            Actions.pop();
        }
    }

    navigateToAct(volume, data, options) {
        const {setActivity, setVolume} = this.props;
        setVolume(volume);
        setActivity(data.variant, data.info, options);
        Actions.push('take_act');
    }

    render() {
        return (
        <Container style={styles.container}>
            <Header>
            <Left>
                <Button transparent onPress={this.props.openDrawer}>
                <Icon name="menu" />
                </Button>
            </Left>
            <Body>
                <Title></Title>
            </Body>
            <Right>
                
            </Right>
            </Header>

            <Content>
                <Spinner />
            </Content>
        </Container>
        );
    }
}

function bindAction(dispatch) {
  return {
    openDrawer: () => dispatch(openDrawer()),
    closeDrawer: () => dispatch(closeDrawer()),
    pushRoute: (route, key) => dispatch(pushRoute(route, key)),
    ...bindActionCreators({
            setActivity,
            setVolume,
            setAnswer,
        }, dispatch)
  };
}

const mapStateToProps = ({core: {auth, acts, notifications, checkedTime, volumes, self, data, actData, userData}}) => ({
  auth: auth,
  acts: acts || [],
  notifications: notifications || {},
  checkedTime,
  volumes: volumes || [],
  user: self || {},
  data: data || [],
  actData: actData || {},
  resCollection: userData && userData[self._id] && userData[self._id].collections && userData[self._id].collections.Responses
});

export default connect(mapStateToProps, bindAction)(PushActivityScreen);
