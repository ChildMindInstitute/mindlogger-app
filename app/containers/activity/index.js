
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


import { auth, base, fbLoadAllActivity, fbDeleteActivity, fbLoadAllActivityByAuthor} from '../../firebase'
import { openDrawer, closeDrawer } from '../../actions/drawer';
import {updateUserLocal} from '../../actions/coreActions';
import * as surveyActions from '../../modules/survey/actions';
import * as voiceActions from '../../modules/voice/actions';
import * as drawingActions from '../../modules/drawing/actions';

import styles from './styles';

var BUTTONS = ["Basic Survey", "Table Survey", "Voice", "Drawing", "Cancel"];

class ActivityScreen extends Component {

  static propTypes = {
    openDrawer: PropTypes.func,
  }

    componentWillMount() {
        this.setState({})
        const {user, surveys, loadSurveys, updateUserLocal} = this.props;
        base.listenTo(`users/${user.uid}`, {
        context: this,
        then(userInfo) {
            this.setState({userInfo})
            const {role} = userInfo
            updateUserLocal({...userInfo})
            if (role == 'clinician') {
                if (surveys.length == 0) {
                    fbLoadAllActivityByAuthor('surveys', user.uid).then(data => {
                        if (data && data.length > 0)
                            loadSurveys(data)
                    })
                    fbLoadAllActivityByAuthor('voices', user.uid).then(data => {
                        if (data && data.length > 0)
                            loadSurveys(data)
                    })
                    fbLoadAllActivityByAuthor('drawings', user.uid).then(data => {
                        if (data && data.length > 0)
                            loadSurveys(data)
                    })
                }
            } else if (role == 'patient') {
                if (surveys.length == 0) {
                    this.loadAllActivity()
                }
            }
        }});
    }
    
    loadAllActivity() {
        fbLoadAllActivity('surveys').then(data => {
            if (data && data.length > 0) {
                this.props.loadSurveys(data)
            }
        })
    }

    pushRoute(route) {
        console.log(route)
        Actions[route]()
        //this.props.pushRoute({ key: route, index: 1 }, this.props.navigation.key);
    }

    popRoute() {
        Actions.pop()
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
                Actions.push("voice_add")
            } else if(buttonIndex == 3) {
                Actions.push("drawing_add")
            }
        }
        )
    }

    editActivity(secId, rowId) {
        
        if(secId == 'surveys') {
            const survey = this.props.surveys[rowId]
            if(survey.mode === 'table') {
                Actions.push("survey_table_add", {surveyIdx:rowId})
            } else {
                Actions.push("survey_basic_add", {surveyIdx:rowId})
            }
        } else if(secId === 'voices') {
            Actions.push("voice_add", {voiceIdx:rowId})
        } else if(secId === 'drawings') {
            Actions.push("drawing_add", {drawingIdx:rowId})
        }
    }

    deleteActivity(secId, rowId) {
        const {deleteSurvey, deleteVoice, deleteDrawing} = this.props
        if(secId === 'surveys') {
            const survey = this.props.surveys[rowId]
            deleteSurvey(rowId)
            
        } else if(secId === 'voices') {
            const voice = this.props.voices[rowId]
            deleteVoice(rowId)
        } else if(secId === 'drawings') {
            const voice = this.props.voices[rowId]
            deleteDrawing(rowId)
        }
        fbDeleteActivity(secId, survey)
        
    }

    startActivity(secId, rowId) {
        if(secId === 'surveys') {
            const {surveys, setSurvey} = this.props
            const survey = surveys[rowId]
            setSurvey({...survey, answers:[]})
            if(survey.audio_url)
                this.playInstruction(survey)
            if(survey.mode == 'table') {
                if(survey.accordion){
                    Actions.survey_table_accordion()
                } else {
                    Actions.survey_table_question({ questionIndex:0})
                }
            } else {
                if(survey.accordion){
                    Actions.survey_accordion()
                } else {
                    Actions.survey_question({ questionIndex:0})
                }
            }
        } else if(secId === 'voices') {
            const {voices, setVoice} = this.props
            let voice = {...voices[rowId]}
            setVoice(voice)
            Actions.push("voice_start")
        } else if(secId === 'drawing') {
            
        }
    }

    editActivityDetail(secId, rowId) {
        console.log(secId)
        if(secId == 'surveys') {
            const survey = this.props.surveys[rowId]
            if (survey.questions.length == 0) {
                Toast.show({text: 'This survey have no questions. Pleaes add questions!', position: 'top', type: 'warning'})
            }
            if(survey.mode == 'table') {
                Actions.push("survey_table_edit_question", {surveyIdx:rowId, questionIdx:0})
            } else {
                Actions.push("survey_basic_edit_question", {surveyIdx:rowId, questionIdx:0})
            }
        }
    }

    _selectRow = (data, secId, rowId) => {
        this.startActivity(secId, rowId)
    }

    _editRow = (data, secId, rowId, rowMap) => {
        rowMap[`${secId}${rowId}`].props.closeRow()
        this.editActivity(secId, rowId)
    }

    _deleteRow = (data, secId, rowId, rowMap) => {
        rowMap[`${secId}${rowId}`].props.closeRow()
        this.deleteActivity(secId, rowId)
    }

    _editRowDetail = (data, secId, rowId, rowMap) => {
        rowMap[`${secId}${rowId}`].props.closeRow()
        this.editActivityDetail(secId, rowId)
    }

    _renderSectionHeader = (data, secId) => {
        return (<Separator bordered><Text>{secId.toUpperCase()}</Text></Separator>)
    }
    
    _renderRow = (data, secId, rowId) => {
        return (
        <ListItem onPress={()=>this._selectRow(data, secId, rowId)}>
        <Body>
            <Text>{data.title}</Text>
            <Text numberOfLines={1} note>{data.instruction}</Text>
        </Body>
        <Right>
            {data.questions && (<Text note>{data.questions.length} questions</Text>)}
        </Right>
        </ListItem>
        )
    }

    _renderRightHiddenRow = (data, secId, rowId, rowMap) => {
        return (
        <View style={{flexDirection:'row', height:63}}>
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
        const {surveys, voices, user} = this.props;
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
                    user.role == 'clinician' ? (
                        <Button transparent onPress={() => this.promptToAddActivity()}>
                            <Icon name="add"/>
                        </Button>
                    ) : (<Button transparent onPress={() => this.loadAllActivity()}><Icon name="refresh"/></Button>)
                }
                
            </Right>
            </Header>

            <Content>
            <List
                dataSource={ds.cloneWithRowsAndSections({surveys, drawings:[], voices:voices})}
                renderRow={this._renderRow}
                renderLeftHiddenRow={this._renderLeftHiddenRow}
                renderRightHiddenRow={this._renderRightHiddenRow}
                renderSectionHeader={this._renderSectionHeader}
                leftOpenValue={60}
                rightOpenValue={-120}
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
    ...bindActionCreators({...surveyActions, ...voiceActions, updateUserLocal}, dispatch)
  };
}

const mapStateToProps = state => ({
  surveys: (state.survey && state.survey.surveys) || [],
  voices: (state.voice && state.voice.voices) || [],
  drawings: (state.drawing && state.drawing.drawings) || [],
  themeState: state.drawer.themeState,
  user: (state.core && state.core.user)
});

export default connect(mapStateToProps, bindAction)(ActivityScreen);
