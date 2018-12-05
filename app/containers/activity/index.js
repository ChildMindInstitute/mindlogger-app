
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import { ListView } from 'react-native';
import { Container, Header, Title, Content, Button, Icon, List, ListItem, Text , Left, Body, Right, ActionSheet, View, Toast, Spinner } from 'native-base';
import { Actions } from 'react-native-router-flux';
import {
    Player,
} from 'react-native-audio-toolkit';
import PushNotification from 'react-native-push-notification';
import TimerMixin from 'react-timer-mixin';
import moment from 'moment';

import Image from '../../components/image/Image';
import { openDrawer, closeDrawer } from '../../actions/drawer';
import {
    setActivity,
    setNotificationStatus,
    clearNotificationStatus,
    setVolumes,
    setVolume,
    setActs,
    updateQueue,
    setAnswer,
} from '../../actions/coreActions';

import { 
    addFolder,
    addItem,
    getObject,
    getCollection,
    getFolders,
    getItems,
    getActVariant,
    getUserCollection
} from '../../actions/api';
import {PushNotificationIOS, Platform} from 'react-native';

import styles from './styles';
import { timeArrayFrom } from './NotificationSchedule';
import Instabug from 'instabug-reactnative';

var BUTTONS = ["Basic Survey", "Table Survey", "Voice", "Drawing", "Cancel"];

var BUTTON_COLORS=["#0067a0", "#919d9d", "#00c1d5", "#b5bd00"];

const DAY_TS = 1000*3600*24;
class ActivityScreen extends Component {

    static propTypes = {
        openDrawer: PropTypes.func,
    }
    componentWillMount() {
        this.setState({})
        const {user, acts, isLogin, volumes} = this.props;
        if(!user) {
            console.warn("undefined user")
            return
        }
        Instabug.identifyUserWithEmail(user.email, user.login);
        if (volumes.length == 0) {
            this.downloadAll();
        } else {
            this.scheduleNotifications(acts);
        }
        PushNotification.configure({

            // (optional) Called when Token is generated (iOS and Android)
            onRegister: function(token) {
                console.log( 'TOKEN:', token );
            },
        
            // (required) Called when a remote or local notification is opened or received
            onNotification: function(notification) {
                console.log( 'NOTIFICATION:', notification );
        
                // process the notification
                // if (Platform.OS == 'ios') {
                //     this.onNotificationIOS(notification);
                // } else {
                //     this.onNotificationAndroid(notification);
                // }
                // required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
                Actions.push('push_act',{notification});
                notification.finish(PushNotificationIOS.FetchResult.NoData);
            },
        
            // ANDROID ONLY: GCM or FCM Sender ID (product_number) (optional - not required for local notifications, but is need to receive remote push notifications)
            //senderID: "YOUR GCM (OR FCM) SENDER ID",
        
            // IOS ONLY (optional): default: all - Permissions to register.
            permissions: {
                alert: true,
                badge: true,
                sound: true
            },
            visibility: 'public',
        
            // Should the initial notification be popped automatically
            // default: true
            popInitialNotification: true,
        
            /**
              * (optional) default: true
              * - Specified if permissions (ios) and token (android and ios) will requested or not,
              * - if not, you must call PushNotificationsHandler.requestPermissions() later
              */
            requestPermissions: true,
            actions: '["Yes", "No"]',
        });
        if (Platform.OS == 'ios') {
        } else {
            PushNotification.registerNotificationActions(['Take', 'Cancel'])
        }

        if (isLogin) {
            this.setupResponse();
        }

        this.syncTimer = TimerMixin.setInterval(this.syncData, 3000);
        this.notificationTimer = TimerMixin.setInterval(this.syncNotifications, 60000);
    }
    promptEmptyActs() {
        Toast.show({text: 'No Activities', position: 'bottom', type: 'danger', duration: 1500})
        this.setState({progress: false})
    }

    downloadActGroup(actGroup) {
        const {getFolders, getItems, getActVariant} = this.props;
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

    downloadInfoGroup(group) {
        const {getFolders, getItems, getActVariant} = this.props;
        return getFolders(group._id, 'infoActs', 'folder').then(acts => {
            return Promise.all(acts.map(act => getActVariant(act._id)
                .then(arr => {
                    const { variant } = this.props.actData[act._id];
                    return getItems(variant._id)
                }))).then(res => {
                    return acts;
                })
        });
    }

    downloadVolume(volume) {
        const {getFolders} = this.props;
        return getFolders(volume._id, 'groups', 'folder').then(res => {
            if (res.length > 0) {
                let actGroup;
                let infoGroup;
                res.forEach(group => {
                    if (group.meta && group.meta.info) {
                        infoGroup = group
                    } else {
                        actGroup = group
                    }
                });
                volume.acts=[];
                volume.infoActs=[];
                let arr = [];
                if (actGroup) {
                    arr.push(this.downloadActGroup(actGroup).then(acts => {
                        acts.forEach(act => {
                            act.volumeId = volume._id;
                        });
                        volume.acts = acts;
                    }));
                }
                if (infoGroup) {
                    arr.push(this.downloadInfoGroup(infoGroup).then(acts => {
                        volume.infoActs = acts;
                    }));
                }
                return Promise.all(arr);
            }
        })

    }

    downloadAll = () => {
        const {getCollection, getFolders, getItems, getActVariant, setVolumes, user, setActs} = this.props;
        this.setState({progress: true});
        getCollection('Volumes').then(res => {
            if (res.length>0)
                return getFolders(res[0]._id, 'volumes');
            else
                this.promptEmptyActs();
        }).then(arr => {
            let volumeId;
            let volumes = [];
            let volumeCount = 0;
            let volumeDownloaded = 0;
            for (let index = 0; index < arr.length; index++) {
                const v = arr[index];
                console.log(v);
                if (v.meta && v.meta.members && v.meta.members.users.includes(user._id)) {
                    console.log(volumeCount);
                    volumes.push(v);
                    volumeCount = volumeCount + 1;
                }
            }
            this.setState({volumeCount, volumeDownloaded});
            let promiseArr = [];
            for (let index = 0; index < volumes.length; index++) {
                const volume = volumes[index];
                promiseArr.push(this.downloadVolume(volume).then(() => {
                    volumeDownloaded = volumeDownloaded + 1;
                    this.setState({volumeCount, volumeDownloaded});
                    return true;
                }));
            }
            return Promise.all(promiseArr).then(res => {
                console.log("downloaded all.....");
                setVolumes(volumes);
                console.log("Volumes set.....")
                let acts = [];
                volumes.forEach(v => {
                    acts = acts.concat(v.acts)
                });
                setActs(acts);
                this.scheduleNotifications(acts, true);
            });
        }).then(res => {
            Toast.show({text: 'Download complete', position: 'bottom', type: 'info', duration: 1500})
            this.setState({progress: false});
        }).catch(err => {
            console.log(err);
            this.setState({progress: false});
        });
    }

    setupResponse() {
        const { addFolder, getUserCollection, user} = this.props;
        getUserCollection(user._id).then(res => {
            if (this.props.resCollection == undefined) {
                addFolder('Responses', {}, user._id, 'user', true).then(res => {
                    return getUserCollection(user._id);
                })
            }
        });
    }

    componentWillUnmount() {
        TimerMixin.clearInterval(this.syncTimer);
    }

    componentWillReceiveProps(nextProps) {
        const {acts, answerData, notifications} = nextProps;
        if (this.props.answerData != answerData) {
            this.orderActs(acts, notifications, answerData);
        }
    }

    scheduleNotifications(acts, isReset = false) {
        let { notifications, checkedTime, setNotificationStatus} = this.props;
        console.log("last check:", checkedTime, acts);
        if (isReset) {
            PushNotification.cancelAllLocalNotifications();
        } else if (checkedTime && checkedTime + DAY_TS > Date.now()) {
            console.log("Notifications: ", notifications);
            // this.orderActs(acts, notifications);
            // return;
        }
        acts.forEach((act, idx) => {
            let variant = this.getVariant(act);
            if (!variant || variant.meta.notification == undefined) return;
            let state = notifications[variant._id] || {};
            let { lastTime } = state;
            if(isReset) {
                lastTime = undefined;
            } else if (lastTime != undefined && Date.now() < lastTime){
                return;
            }
            
            let times = timeArrayFrom(variant.meta.notification, Date.now());
            let message = `Please perform activity: ${act.name}`;
            let userInfo = { actId: act._id };
            let time;
            if(times.length > 0) {
                time = times[0];
                if (lastTime == undefined || time.getTime()>lastTime) {
                    PushNotification.localNotificationSchedule({
                        //... You can use all the options from localNotifications
                        message , // (required)
                        tag: `${idx}`,
                        data: userInfo,
                        userInfo,
                        date: time
                    });
                }
                lastTime = time.getTime();
            }
            notifications[act._id] = { modifiedAt: Date.now(), name: act.name , lastTime, times};
        });
        setNotificationStatus(notifications);
        this.orderActs(acts, notifications);
    }

    loadAllActivity = (isReload=false) => {
        if (isReload) {
            this.downloadAll()
            this.setupResponse()
        }
    }

    orderActs(acts, notifications, newAnswerData) {
        const {actData} = this.props;
        let answerData = newAnswerData || this.props.answerData;
        let dueActs = [];
        let todoActs = [];
        
        acts.forEach(act => {
            if (!actData[act._id]) return;
            let variantId = actData[act._id].variant._id;
            let nextTime = notifications[act._id] && notifications[act._id].times[0];
            if (answerData[variantId]) {
                dueActs.push({...act, nextTime });
            } else {
                todoActs.push({...act, nextTime });
            }
        });
        todoActs.sort((act1, act2) => {
            if (!act1.nextTime) return 1;
            if (!act2.nextTime) return -1;
            if (act1.nextTime < act2.nextTime) return -1;
            if (act1.nextTime == act2.nextTime) return 0;
            if (act1.nextTime > act2.nextTime) return 1;
        })
        this.setState({dueActs, todoActs});
    }

    pushRoute(route) {
        Actions[route]();
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
        return this.props.actData[act._id] && this.props.actData[act._id].variant;
    }

    startActivity(act, secId) {
        const {setActivity, actData, volumes} = this.props;
        let volume = volumes.find(volume => volume._id == act.volumeId);
        this.navigateToAct(volume, actData[act._id])
    }

    navigateToAct(volume, data, options) {
        const {setActivity, setVolume} = this.props;
        if (data) {
            setVolume(volume);
            setActivity(data.variant, data.info, options);
            Actions.push('take_act');
        }
    }

    editActivityDetail(rowId) {
        let actIndex = rowId;
        let act = this.props.acts[actIndex];
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

    _selectRow = (act, rowId, secId) => {
        this.startActivity(act, secId);
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
        let volume = this.props.volumes.find(volume => volume._id == act.volumeId);
        if(!act || !volume) 
            return (<ListItem>

            </ListItem>);
        let buttonStyle = {width: 30, height: 30, borderRadius:15, alignItems: 'center', paddingTop: 6}
        buttonStyle.backgroundColor = BUTTON_COLORS[parseInt(act.volumeId.substr(-1),16)%4];
        
        let index = parseInt(secId);
        let dateStr = "";
        if (act.nextTime) {
            let actDate = moment(act.nextTime);
            let currentDate = moment();
            if (actDate.dayOfYear() == currentDate.dayOfYear()) {
                dateStr = actDate.format("LT");
            } else {
                dateStr = actDate.format("MMM D")
            }
        }
        
        return (
        <ListItem avatar onPress={()=>this._selectRow(act, rowId, secId)}>
            <Left>
                { volume.meta && volume.meta.logoImage ?
                <Image thumb square file={volume.meta.logoImage}/> :
                <View style={buttonStyle}><Text style={styles.letter}>{volume.meta.shortName[0]}</Text></View> }
            </Left>
            <Body>
                <Text style={index == 0 ? {color:"#11c"} : {}}>{act.name}</Text>
                <Text note></Text>
            </Body>
            <Right>
                <Text note>{ dateStr }</Text>
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
        return false
        // Deprecated edit activity on mobile app
        // return (
        // <View style={{flexDirection:'row', height:63}}>
        //     <Button full style={{height:63, width: 60}} onPress={_ => this._editRowDetail(data, secId, rowId, rowMap)}>
        //     <Icon active name="list" />
        //     </Button>
        // </View>
        // )
    }

    syncData = () => {
        const {answerCache, addFolder, updateQueue, addItem} = this.props;
        var arr = [];
        answerCache.forEach(({name, payload, volumeName, collectionId, synced}, index) => {
            if (synced) return
            let pr = addFolder(volumeName,{},collectionId, 'folder', true).then(folder => {
                return addItem(name, payload, folder._id).then(res => {
                    answerCache[index].synced = true;
                    console.log("Synced answer", res);
                    return true;
                });
            })
            arr.push(pr);
        });
        if (arr.length == 0) return;
        Promise.all(arr).then(res => {
            updateQueue(answerCache);
            console.log("Synced all answers", answerCache)
        }).catch(err => {
            console.log(err)
        });
    }

    syncNotifications = () => {
        const {acts} = this.props;
        if (acts.length == 0) return;
        this.scheduleNotifications(acts);
    }

    render() {
        const {user, acts} = this.props;
        const {dueActs, todoActs, progress, volumeCount, volumeDownloaded} = this.state;

        let dataBlob = {};
        if (todoActs) {
            dataBlob[0] = dueActs;
            dataBlob[1] = todoActs;
        }
        // let volumeIds = [];
        // volumes.forEach((volume,idx) => {
        //     dataBlob[idx] = volume.acts || [];
        //     volumeIds.push(volume._id);
        // });
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
                { this.state.progress && <Text style={styles.text}>Downloaded {volumeDownloaded} of {volumeCount} activity sets</Text> }
                {acts && 
                <List
                    dataSource={ds.cloneWithRowsAndSections(dataBlob)}
                    renderRow={this._renderRow}
                    renderLeftHiddenRow={this._renderLeftHiddenRow}
                    renderRightHiddenRow={this._renderRightHiddenRow}
                    leftOpenValue={0}
                    rightOpenValue={user.role == 'admin' ? -120 : 0}
                    enableEmptySections
                /> }
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
            clearNotificationStatus,
            getActVariant,
            setVolumes,
            setVolume,
            setActs,
            getUserCollection,
            addFolder,
            addItem,
            updateQueue,
            setAnswer,
        }, dispatch)
  };
}

const mapStateToProps = ({core: {auth, acts, notifications, checkedTime, volumes, self, actData, userData, answerCache = [], answerData = {}}}) => ({
  auth: auth,
  acts: acts || [],
  notifications: notifications || {},
  checkedTime,
  volumes: volumes || [],
  user: self || {},
  actData: actData || {},
  resCollection: userData && userData[self._id] && userData[self._id].collections && userData[self._id].collections.Responses,
  answerCache,
  answerData,
});

export default connect(mapStateToProps, bindAction)(ActivityScreen);
