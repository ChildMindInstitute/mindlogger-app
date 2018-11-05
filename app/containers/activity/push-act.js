
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import { Container, Header, Title, Content, Button, Icon, List, ListItem, Text , Left, Body, Right, ActionSheet, View, Separator, SwipeRow, Toast, Spinner, Thumbnail } from 'native-base';
import { Actions } from 'react-native-router-flux';

import { openDrawer, closeDrawer } from '../../actions/drawer';
import {
    setActivity,
    setVolume,
    setNotificationStatus,
} from '../../actions/coreActions';

import { 
    addFolder,
    getObject,
    getCollection,
    getFolders,
    getItems,
    getActVariant,
    getUserCollection
} from '../../actions/api';
import {Platform} from 'react-native';

import styles from './styles';


const DAY_TS = 1000*3600*24;
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
    promptEmptyActs() {
        Toast.show({text: 'No Activities', position: 'bottom', type: 'danger', duration: 1500})
        this.setState({progress: false})
    }

    downloadActGroup(actGroup) {
        const {getFolders, getItems, getActVariant, user} = this.props;
        return getFolders(actGroup._id, 'acts', 'folder').then(acts => {
            return Promise.all(acts.map(act => getActVariant(act._id)
                .then(arr => {
                    const { variant, info } = this.props.actData[act._id];
                    return getItems(variant._id).then(res => {
                        if(info) {
                            return getItems(info._id)
                        }
                    });
                }))).then(res => {
                    return acts;
                });
        });
    }

    onNotificationIOS = (notification) => {
        let {data} = notification;
        if(data)
            this.startActivityFromNotification(data.actId)
    }

    onNotificationAndroid = (notification) => {
        const { acts } = this.props;
        let index = parseInt(notification.data.id);
        if(acts[index])
            this.startActivityFromNotification(acts[index]._id);
    }

    startActivityFromNotification(actId){
        const {acts, setActivity, actData, volumes, setVolume} = this.props;
        const act = acts.find( a => a._id == actId )
        const volume = volumes.find(v => v._id == act.volumeId);
        if(volume) {
            setVolume(volume);
        } else {
            return;
        }
        if (actData[actId]) {
            setActivity(
                actData[actId].variant,
                actData[actId].info,
                {
                    notificationTime: Date.now()
                });
            Actions.replace('take_act');
        }
    }

    render() {
        const {user, volumes} = this.props;
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

    playInstruction(activity) {
        const {audio_url} = activity
        if (this.player) {
            this.player.destroy();
        }
        this.player = new Player(audio_url, {
            autoDestroy: false
        }).prepare((err) => {
            if (err) {
                console.log('error at _reloadPlayer():');
                console.log(err);
            } else {
                console.log(audio_url)
                this.player.play((err, playing) => {
                    console.log(err,playing)
                })
            }
        });
    }
}

function bindAction(dispatch) {
  return {
    openDrawer: () => dispatch(openDrawer()),
    closeDrawer: () => dispatch(closeDrawer()),
    pushRoute: (route, key) => dispatch(pushRoute(route, key)),
    ...bindActionCreators({
            setActivity,
            getObject,
            getCollection,
            getFolders,
            getItems,
            setNotificationStatus,
            getActVariant,
            setVolume,
            getUserCollection,
            addFolder
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
