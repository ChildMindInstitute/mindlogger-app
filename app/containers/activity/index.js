
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import { actions } from 'react-native-navigation-redux-helpers';
import { ListView } from 'react-native';
import { Container, Header, Title, Content, Button, Icon, List, ListItem, Text , Left, Body, Right, ActionSheet, View, Separator, SwipeRow } from 'native-base';
import { Actions } from 'react-native-router-flux';

import { auth, base} from '../../firebase'
import {fbLoadAllActivity, fbDeleteActivity, fbLoadAllActivityByAuthor} from '../../helper'
import { openDrawer, closeDrawer } from '../../actions/drawer';
import {updateUserLocal} from '../../actions/coreActions';
import * as surveyActions from '../../modules/survey/actions';
import * as audioActions from '../../modules/audio/actions';

import styles from './styles';

var BUTTONS = ["Basic Survey", "Table Survey", "Voice", "Drawing", "Cancel"];

class ActivityScreen extends Component {

  static propTypes = {
    openDrawer: PropTypes.func,
    navigation: PropTypes.shape({
      key: PropTypes.string,
    }),
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
                }
            } else if (role == 'patient') {
                fbLoadAllActivity('surveys').then(data => {
                    if (data && data.length > 0) {
                        loadSurveys(data)
                    }
                })
            }
        }});
    
    
  }

  pushRoute(route) {
    console.log(route)
    Actions[route]()
    //this.props.pushRoute({ key: route, index: 1 }, this.props.navigation.key);
  }

  popRoute() {
    this.props.popRoute(this.props.navigation.key);
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
          Actions.survey_table_add()
        } else if(buttonIndex == 2) {
          Actions.push("audio_add")
        } else if(buttonIndex == 3) {
          
        }
      }
    )
  }

  editActivity(secId, rowId) {
    
    if(secId == 'surveys') {
      const survey = this.props.surveys[rowId]
      if(survey.mode == 'table') {
        Actions.push("survey_table_add", {surveyIdx:rowId})
      } else {
        Actions.push("survey_basic_add", {surveyIdx:rowId})
      }
    } else if(secId == 'voices') {
      Actions.push("audio_add", {audioIdx:rowId})
    }
  }

  deleteActivity(secId, rowId) {
    if(secId === 'surveys') {
      const survey = this.props.surveys[rowId]
      this.props.deleteSurvey(rowId)
      fbDeleteActivity(secId, survey)
    } else if(secId === 'voices') {
      this.props.deleteAudioActivity(rowId)
    }
    
  }

  startActivity(secId, rowId) {
    if(secId === 'surveys') {
      const {surveys, setSurvey} = this.props
      const survey = surveys[rowId]
      setSurvey({...survey, answers:[]})
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
      const {audios, setAudio} = this.props
      let audio = {...audios[rowId]}
      setAudio(audio)
      Actions.push("audio_start")
    }
  }

  editActivityDetail(secId, rowId) {
    console.log(secId)
    if(secId == 'surveys') {
      const survey = this.props.surveys[rowId]
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
    const {surveys, audios, user} = this.props;
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
                user.role == 'clinician' && (
                    <Button transparent onPress={() => this.promptToAddActivity()}>
                        <Icon name="add"/>
                    </Button>
                )
            }
            
          </Right>
        </Header>

        <Content>
          <List
            dataSource={ds.cloneWithRowsAndSections({surveys, drawings:[], voices:audios})}
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
}

function bindAction(dispatch) {
  return {
    openDrawer: () => dispatch(openDrawer()),
    closeDrawer: () => dispatch(closeDrawer()),
    pushRoute: (route, key) => dispatch(pushRoute(route, key)),
    ...bindActionCreators({...surveyActions, ...audioActions, updateUserLocal}, dispatch)
  };
}

const mapStateToProps = state => ({
  surveys: (state.survey && state.survey.surveys) || [],
  audios: (state.audio && state.audio.audios) || [],
  drawings: (state.drawing && state.drawing.drawings) || [],
  navigation: state.cardNavigation,
  themeState: state.drawer.themeState,
  user: (state.core && state.core.user)
});

export default connect(mapStateToProps, bindAction)(ActivityScreen);
