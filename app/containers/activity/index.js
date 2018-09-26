
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import { ListView } from 'react-native';
import { Container, Header, Title, Content, Button, Icon, List, ListItem, Text , Left, Body, Right, ActionSheet, View, Separator, SwipeRow, Toast, Spinner } from 'native-base';
import { Actions } from 'react-native-router-flux';
import {
    Player,
    MediaStates
} from 'react-native-audio-toolkit';
import PushNotification from 'react-native-push-notification';

import { openDrawer, closeDrawer } from '../../actions/drawer';
import { updateUserLocal, setActivity, setAnswer, setNotificationStatus } from '../../actions/coreActions';

import { getObject, getCollection, getFolders, getItems, getActVariant } from '../../actions/api';
import {PushNotificationIOS, Platform} from 'react-native';

import styles from './styles';
import { timeArrayFrom } from './NotificationSchedule';

var BUTTONS = ["Basic Survey", "Table Survey", "Voice", "Drawing", "Cancel"];

const DAY_TS = 1000*3600*24;
class ActivityScreen extends Component {

    static propTypes = {
        openDrawer: PropTypes.func,
    }
    componentWillMount() {
        this.setState({})
        const {user, acts, getCollection, getFolders, } = this.props;
        if(!user) {
            console.warn("undefined user")
            return
        }
        if (acts.length == 0) {
            this.downloadAll();
        } else {
            this.scheduleNotifications(acts);
        }
        if (Platform.OS == 'ios') {
            PushNotificationIOS.addEventListener('localNotification',this.onNotificationIOS);
        } else {
            PushNotification.registerNotificationActions(['Take', 'Cancel'])
        }
    }
    promptEmptyActs() {
        Toast.show({text: 'No Activities', position: 'bottom', type: 'danger', buttonText: 'OK'})
        this.setState({progress: false})
    }
    downloadAll() {
        const {getCollection, getFolders, getItems, getActVariant, user} = this.props;
        this.setState({progress: true});
        getCollection('Volumes').then(res => {
            if (res.length>0)
                return getFolders(res[0]._id, 'volumes');
            else
                this.promptEmptyActs();
        }).then(volumes => {
            console.log(volumes);
            let volumeId;
            for (let index = 0; index < volumes.length; index++) {
                const v = volumes[index];
                if (v.meta && v.meta.members && v.meta.members.users.includes(user._id)) {
                    volumeId = v._id;
                    break;
                }
            }
            if (volumeId)
                return getFolders(volumeId, 'groups', 'folder');
            else
                this.promptEmptyActs();
        }).then(res => {
            console.log(res);
            if (res.length > 0) {
                return getFolders(res[0]._id, 'acts', 'folder');
            } else {
                this.promptEmptyActs();
            }
        }).then(acts => {
            return Promise.all(acts.map(act => getActVariant(act._id)
                .then(arr => {
                    const { variant, info } = this.props.actData[act._id];
                    return getItems(variant._id).then(res => {
                        if(info) {
                            console.log(info);
                            return getItems(info._id)
                        }
                    });
                }))).then(res => {
                    this.scheduleNotifications(acts);
                });
        }).then(res => {
            Toast.show({text: 'Download complete', position: 'bottom', type: 'info', duration: 1500})
            this.setState({progress: false});
        }).catch(err => {
            console.log(err);
            this.setState({progress: false});
        });
    }

    downloadFromAct(actVariant) {
        return getItems(actVariant._id, '')
    }
    componentWillUnmount() {
        PushNotificationIOS.removeEventListener('localNotification', this.onNotificationIOS);
    }

    scheduleNotifications(acts) {
        let { notifications, checkedTime, setNotificationStatus} = this.props;
        console.log("last check:", checkedTime);
        if (checkedTime && checkedTime + DAY_TS > Date.now()) return;
        acts.forEach((act, idx) => {
            let variant = this.getVariant(act);
            let state = notifications[variant._id] || {};
            let { lastTime } = state;
            console.log(variant);
            let times = timeArrayFrom(variant.meta.notification, lastTime);
            let message = `Please perform activity: ${act.name}`;
            let userInfo = { actId: act._id };
            console.log(times);
            times.forEach(time => {
                PushNotification.localNotificationSchedule({
                    id: `${idx}`,
                //... You can use all the options from localNotifications
                message , // (required)
                userInfo,
                date: time
              });
              lastTime = time.getTime();
              console.log("scheduledAt", time);
            });
            notifications[act._id] = { modifiedAt: Date.now(), lastTime };
        });
        setNotificationStatus(notifications);
    }

    onNotificationIOS = (notification) => {
        let {userInfo} = notification;
        if(userInfo)
            this.startActivityFromId(userInfo.actId)
    }

    onNotificationAndroid = (notification) => {
        const { acts } = this.props;
        let index = parseInt(notification.id);
        this.startActivityFromId(acts[index]);
    }

    startActivityFromId(actId){
        const {user, acts} = this.props;
        let act;
        acts.forEach(element => {
            if (element._id == actId) {
                act = element;
            }
        });
        this.startActivity(act);
    }

    loadAllActivity = (isReload=false) => {
        if (isReload) {
            this.downloadAll()
        }
    }

    pushRoute(route) {
        console.log(route)
        Actions[route]();
        //this.props.pushRoute({ key: route, index: 1 }, this.props.navigation.key);
    }

    popRoute() {
        Actions.pop();
    }

    promptToAddActivity() {
        ActionSheet.show(
        {
            options: BUTTONS,
            cancelButtonIndex: 4,
            title: "Please select type of activity to add"
        },
        buttonIndex => {
            if(buttonIndex==0) {
                Actions.push("survey_basic_add");
            } else if(buttonIndex == 1) {
                Actions.push("survey_table_add")
            } else if(buttonIndex == 2) {
                Actions.push("voice_add");
            } else if(buttonIndex == 3) {
                Actions.push("drawing_add");
            }
        }
        )
    }

    promptToEditActivity(rowId) {
        ActionSheet.show(
        {
            options: ["Set frequency time", "Edit questions", "Cancel"],
            cancelButtonIndex: 2,
            title: "Please select type of activity to add"
        },
        buttonIndex => {
            if(buttonIndex==0) {
                this.editFrequency(rowId);
            } else if(buttonIndex == 1) {
                this.editActivityDetail(rowId);
            }
        }
        )
    }

    editActivity(act, rowId) {
        let actIndex = rowId;
        Toast.show({text: `${this.state[secId]}`, buttonText:'ok'})
        if(secId == 'surveys') {
            const survey = act;
            if(survey.act_data.mode === 'table') {
                Actions.push("survey_table_add", {actIndex})
            } else {
                Actions.push("survey_basic_add", {actIndex})
            }
        } else if(secId === 'voices') {
            Actions.push("voice_add", {actIndex})
        } else if(secId === 'drawings') {
            Actions.push("drawing_add", {actIndex})
        }
    }

    deleteActivity(rowId) {
        const {deleteAct, acts} = this.props;
        let actIndex = rowId;
        
        return deleteAct(actIndex, acts[actIndex]).then(res => {
            Toast.show({text: 'Deleted successfully', buttonText: 'OK'})
        }).catch(err => {
            Toast.show({text: 'Error! '+err.message, type: 'danger', buttonText: 'OK' })
        })
    }

    getVariant(act) {
        return this.props.actData[act._id].variant;
    }

    startActivity(act) {
        const {setActivity, actData} = this.props;
        console.log(actData[act._id]);
        setActivity(actData[act._id].variant, actData[act._id].info);
        Actions.push('take_act');
    }

    editActivityDetail(rowId) {
        let actIndex = rowId;
        let act = this.props.acts[actIndex];
        console.log(secId)
        if(secId == 'surveys') {
            const survey = act.act_data
            if (!survey.questions || survey.questions.length == 0) {
                Toast.show({text: 'This survey have no questions. Pleaes add questions!', position: 'top', type: 'warning', buttonText:'OK'})
            }
            if(survey.mode == 'table') {
                Actions.push("survey_table_edit_question", {actIndex, questionIdx:0})
            } else {
                Actions.push("survey_basic_edit_question", {actIndex, questionIdx:0})
            }
        }
    }

    _selectRow = (act, rowId) => {
        this.startActivity(act)
    }

    _editRow = (act, secId, rowId, rowMap) => {
        rowMap[`${secId}${rowId}`].props.closeRow();
        rowMap[rowId].props.closeRow();
        this.editActivity(act, rowId);
    }

    _deleteRow = (act, secId, rowId, rowMap) => {
        rowMap[`${secId}${rowId}`].props.closeRow();
        this.deleteActivity(rowId)
    }

    _editRowDetail = (act, secId, rowId, rowMap) => {
        rowMap[`${secId}${rowId}`].props.closeRow();
        if(secId == 'surveys')
            this.promptToEditActivity(rowId);
        else
            this.editFrequency(act, rowId);
    }

    editFrequency = (actIndex) => {
        Actions.push("frequency", {actIndex})
    }

    _renderRow = (act, secId, rowId) => {
        let data = act.meta || {};
        return (
        <ListItem onPress={()=>this._selectRow(act, rowId)}>
        <Body>
            <Text>{act.name}</Text>
            <Text numberOfLines={1} note>{data.description ? data.description : ' '}</Text>
        </Body>
        <Right>
        </Right>
        </ListItem>
        )
    }

    _renderRightHiddenRow = (data, secId, rowId, rowMap) => {
        const {user} = this.props
        if(user.role != 'admin') return false
        return (
        <View style={{flexDirection:'row', height:63}}>
            <Button full info style={{height:63, width: 60}} onPress={_ => this._editFrequency(rowId)}>
                <Icon active name="brush" />
            </Button>
            <Button full info style={{height:63, width: 60}} onPress={_ => this._editRow(data, secId, rowId, rowMap)}>
            <Icon active name="build" />
            </Button>
            <Button full danger style={{height:63, width: 60}} onPress={_ => this._deleteRow(data, secId, rowId, rowMap)}>
            <Icon active name="trash" />
            </Button>
        </View>
        )
    }

    _renderLeftHiddenRow = (data, secId, rowId, rowMap) => {
        return (
        <View style={{flexDirection:'row', height:63}}>
            <Button full style={{height:63, width: 60}} onPress={_ => this._editRowDetail(data, secId, rowId, rowMap)}>
            <Icon active name="list" />
            </Button>
        </View>
        )
    }

    render() {
        const {user, acts} = this.props
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2, sectionHeaderHasChanged: (s1,s2) => s1 !==s2 });
        return (
        <Container style={styles.container}>
            <Header>
            <Left>
                <Button transparent onPress={this.props.openDrawer}>
                <Icon name="menu" />
                </Button>
            </Left>
            <Body>
                <Title>Activities</Title>
            </Body>
            <Right>
                {
                    user.role == 'admin' ? (
                        <Button transparent onPress={() => this.promptToAddActivity()}>
                            <Icon name="add"/>
                        </Button>
                    ) : (<Button transparent onPress={() => this.loadAllActivity(true)}><Icon name="refresh"/></Button>)
                }
                
            </Right>
            </Header>

            <Content>
                { this.state.progress && <Spinner /> }
            <List
                dataSource={ds.cloneWithRows(acts)}
                renderRow={this._renderRow}
                renderLeftHiddenRow={this._renderLeftHiddenRow}
                renderRightHiddenRow={this._renderRightHiddenRow}
                leftOpenValue={60}
                rightOpenValue={user.role == 'admin' ? -120 : 0}
                enableEmptySections
            />
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
            setAnswer,
            getObject,
            getCollection,
            getFolders,
            getItems,
            setNotificationStatus,
            getActVariant
        }, dispatch)
  };
}

const mapStateToProps = state => ({
  auth: state.core.auth,
  notifications: state.core.notifications || {},
  checkedTime: state.core.checkedTime,
  user: state.core.self,
  acts: (state.core.folder && state.core.folder.acts) || [],
  data: state.core.data || [],
  actData: state.core.actData || {},
});

export default connect(mapStateToProps, bindAction)(ActivityScreen);
