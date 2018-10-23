
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import { ListView } from 'react-native';
import { Container, Header, Title, Content, Button, Icon, List, ListItem, Text , Left, Body, Right, ActionSheet, View, Separator, SwipeRow, Toast, Spinner, Thumbnail } from 'native-base';
import { Actions } from 'react-native-router-flux';
import {
    Player,
    MediaStates
} from 'react-native-audio-toolkit';
import PushNotification from 'react-native-push-notification';
import Image from '../../components/image/Image';

import { openDrawer, closeDrawer } from '../../actions/drawer';
import {
    updateUserLocal,
    setActivity,
    setNotificationStatus,
    setVolumes,
    setVolume,
    setActs,
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
        const {user, acts, getCollection, getFolders, isLogin, volumes, setVolume, volume } = this.props;
        if(!user) {
            console.warn("undefined user")
            return
        }
        if (volumes.length == 0) {
            this.downloadAll();
        } else {
            this.scheduleNotifications(acts);
        }
        if (Platform.OS == 'ios') {
            PushNotificationIOS.addEventListener('localNotification',this.onNotificationIOS);
        } else {
            PushNotification.registerNotificationActions(['Take', 'Cancel'])
        }

        if (isLogin) {
            this.setupResponse();
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

    downloadInfoGroup(group) {
        const {getFolders, getItems, getActVariant, user} = this.props;
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
                        console.log("info", acts);
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
            for (let index = 0; index < arr.length; index++) {
                const v = arr[index];
                if (v.meta && v.meta.members && v.meta.members.users.includes(user._id)) {
                    volumes.push(v);
                }
            }
            let promiseArr = [];
            for (let index = 0; index < volumes.length; index++) {
                const volume = volumes[index];
                promiseArr.push(this.downloadVolume(volume));
            }
            return Promise.all(promiseArr).then(res => {
                setVolumes(volumes);
                let acts = [];
                volumes.forEach(v => {
                    acts.push(v.acts)
                });
                setActs(acts);
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
        PushNotificationIOS.removeEventListener('localNotification', this.onNotificationIOS);
    }

    scheduleNotifications(acts) {
        let { notifications, checkedTime, setNotificationStatus} = this.props;
        console.log("last check:", checkedTime);
        if (checkedTime && checkedTime + DAY_TS > Date.now()) return;
        acts.forEach((act, idx) => {
            let variant = this.getVariant(act);
            if (!variant) return;
            let state = notifications[variant._id] || {};
            let { lastTime } = state;
            console.log(variant);
            if (variant.meta.notification == undefined) return;
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
            this.startActivityFromNotification(userInfo.actId)
    }

    onNotificationAndroid = (notification) => {
        const { acts } = this.props;
        let index = parseInt(notification.id);
        if(acts[index])
            this.startActivityFromNotification(acts[index]._id);
    }

    startActivityFromNotification(actId){
        const {user, acts, setActivity, actData, volumes, setVolume} = this.props;
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
            Actions.push('take_act');
        }
    }

    loadAllActivity = (isReload=false) => {
        if (isReload) {
            this.downloadAll()
            this.setupResponse()
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
        return this.props.actData[act._id] && this.props.actData[act._id].variant;
    }

    startActivity(act, secId) {
        const {setActivity, actData, volumes, setVolume} = this.props;
        const idx = parseInt(secId);
        setVolume(volumes[idx]);
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
        let data = act.meta || {};
        const {volumes} = this.props;
        return (
        <ListItem avatar onPress={()=>this._selectRow(act, rowId, secId)}>
            <Left>
                { volumes[secId].meta && volumes[secId].meta.logoImage ?
                <Image thumb square file={volumes[secId].meta.logoImage}/> :
                <Button rounded><Text>{volumes[secId].meta.shortName[0]}</Text></Button> }
            </Left>
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
        const {user, volumes} = this.props;
        let dataBlob = {};
        let volumeIds = [];
        volumes.forEach((volume,idx) => {
            dataBlob[idx] = volume.acts || [];
            volumeIds.push(volume._id);
        });
        console.log(dataBlob);
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
                dataSource={ds.cloneWithRowsAndSections(dataBlob)}
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
            getObject,
            getCollection,
            getFolders,
            getItems,
            setNotificationStatus,
            getActVariant,
            setVolumes,
            setVolume,
            setActs,
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

export default connect(mapStateToProps, bindAction)(ActivityScreen);
