
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import { ListView } from 'react-native';
import { Container, Header, Title, Content, Button, Icon, List, ListItem, Text , Left, Body, Right, ActionSheet, View, Separator, SwipeRow, Toast } from 'native-base';
import { Actions } from 'react-native-router-flux';
import {
    Player,
    MediaStates
} from 'react-native-audio-toolkit';

import { openDrawer, closeDrawer } from '../../actions/drawer';
import { updateUserLocal, setActivity, setAnswer } from '../../actions/coreActions';

import { getActs, getAssignedActs,deleteAct } from '../../actions/api';
import {PushNotificationIOS, Platform} from 'react-native';
import PushNotification from 'react-native-push-notification';

import styles from './styles';

var BUTTONS = ["Basic Survey", "Table Survey", "Voice", "Drawing", "Cancel"];

class ActivityScreen extends Component {

    static propTypes = {
        openDrawer: PropTypes.func,
    }
    componentWillMount() {
        this.setState({})
        const {user, acts, getActs, updateUserLocal, getAssignedActs} = this.props;
        if(!user) {
            console.warn("undefined user")
            return
        }
        this.loadAllActivity()
        if (Platform.OS == 'ios') {
            PushNotificationIOS.addEventListener('localNotification',this.onNotificationIOS);
        } else {
            PushNotification.registerNotificationActions(['Take', 'Cancel'])
        }
    }
    componentWillUnmount() {
        PushNotificationIOS.removeEventListener('localNotification', this.onNotificationIOS);
    }

    onNotificationIOS = (notification) => {
        let {userInfo:{act_id}} = notification;
        this.startActivityFromId(act_id)
    }

    onNotificationAndroid = (notification) => {
        let act_id = floor(parseInt(notification.id)/10)
        this.startActivityFromId(act_id)
    }

    startActivityFromId(act_id){
        const {user, acts} = this.props;
        let act;
        acts.forEach(element => {
            if (element.id == act_id) {
                act = element;
            }
        });
        this.startActivity(act);
    }

    loadAllActivity = (isReload=false) => {
        const {user, acts, getActs, updateUserLocal, getAssignedActs} = this.props;
        const {role} = user
        if (role == 'admin') {
            getActs().then(data => {
                
            }).catch(err => {
                console.log(err)
                Toast.show({text: err.message, position: 'bottom', type: 'danger', buttonText: 'ok'})
            })
        } else if (role == 'user') {
            if (acts.length == 0 || isReload) {
                getAssignedActs().then(data => {
                    
                }).catch(err => {
                    console.log(err)
                    Toast.show({text: err.message, position: 'bottom', type: 'danger', buttonText: 'ok'})
                })
            }
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

    startActivity(act) {
        console.log(act);
        const {setActivity} = this.props
        
        if(act.type === 'survey') {
            const survey = act.act_data
            setActivity(act)
            if(survey.audio_url)
                this.playInstruction(survey)
            if(survey.mode == 'table') {
                if(survey.accordion && survey.accordion != "false"){
                    Actions.survey_table_accordion()
                } else {
                    Actions.survey_question({ questionIndex:0})
                }
            } else {
                if(survey.accordion && survey.accordion != "false"){
                    Actions.survey_accordion()
                } else {
                    Actions.survey_question({ questionIndex:0})
                }
            }
        } else if(act.type == 'voice') {
            let voice = act
            setActivity(act)
            Actions.push("voice_activity")
        } else if(act.type == 'drawing') {
            let drawing = act.act_data
            if(drawing.audio_url)
                this.playInstruction(drawing)
            setActivity(act)
            Actions.push("drawing_activity")
        }
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
        let data = act.act_data;
        return (
        <ListItem onPress={()=>this._selectRow(act, rowId)}>
        <Body>
            <Text>{act.title}</Text>
            <Text numberOfLines={1} note>{data.instruction ? data.instruction : ' '}</Text>
        </Body>
        <Right>
            {data.questions && (<Text note>{data.questions.length} questions</Text>)}
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
    ...bindActionCreators({setActivity, getActs, getAssignedActs, updateUserLocal, deleteAct, setAnswer}, dispatch)
  };
}

const mapStateToProps = state => ({
  themeState: state.drawer.themeState,
  user: (state.core && state.core.auth),
  acts: state.core.acts || [],
  act: state.core.act || {},
});

export default connect(mapStateToProps, bindAction)(ActivityScreen);
