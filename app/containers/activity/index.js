
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions } from 'react-native-navigation-redux-helpers';
import { ListView } from 'react-native';
import { Container, Header, Title, Content, Button, Icon, List, ListItem, Text , Left, Body, Right, ActionSheet, View, Separator, SwipeRow } from 'native-base';
import { Actions } from 'react-native-router-flux';

import { openDrawer, closeDrawer } from '../../actions/drawer';
import { deleteSurvey } from '../../modules/survey/actions';

import styles from './styles';
const {
  pushRoute,popRoute,
} = actions;

var BUTTONS = ["Basic Survey", "Table Survey", "Voice", "Drawing", "Cancel"];

class ActivityScreen extends Component {

  static propTypes = {
    openDrawer: React.PropTypes.func,
    pushRoute: React.PropTypes.func,
    navigation: React.PropTypes.shape({
      key: React.PropTypes.string,
    }),
  }

  pushRoute(route) {
    Actions.push(route)
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
        switch (buttonIndex) {
          case 0:
            this.pushRoute('survey_basic_add')
            break;
          case 1:
            this.pushRoute('survey_table_add')
            break;
          default:
            break;
        }
      }
    )
  }

  editActivity(secId, rowId) {
    
    if(secId === 'surveys') {
      const survey = this.props.surveys[rowId]
      if(survey.mode === 'table') {
        Actions.push("survey_table_edit_question", {surveyIdx:rowId, questionIdx:0})
      } else {
        Actions.push("survey_basic_edit_question", {surveyIdx:rowId, questionIdx:0})
      }
      
    }
  }

  deleteActivity(secId, rowId) {
    if(secId === 'surveys') {
      this.props.deleteSurvey(rowId)
    }
  }

  _editRow = (data, secId, rowId, rowMap) => {
    rowMap[`${secId}${rowId}`].props.closeRow()
    this.editActivity(secId, rowId)
  }

  _deleteRow = (data, secId, rowId, rowMap) => {
    rowMap[`${secId}${rowId}`].props.closeRow()
    this.deleteActivity(secId, rowId)
  }

  _renderSectionHeader = (data, secId) => {
    return (<Separator bordered><Text>{secId.toUpperCase()}</Text></Separator>)
  }
  
  _renderRow = (data) => {
    return (
    <ListItem>
      <Body>
        <Text>{data.title}</Text>
        <Text numberOfLines={1} note>{data.instruction}</Text>
      </Body>
      <Right>
        <Text note>{data.questions.length} questions</Text>
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

  render() {
    const {surveys} = this.props;
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
            <Button transparent onPress={() => this.promptToAddActivity()}>
              <Icon name="add" />
            </Button>
          </Right>
        </Header>

        <Content>
          <List
            dataSource={ds.cloneWithRowsAndSections({surveys:this.props.surveys, drawing:[], voice:[]})}
            renderRow={this._renderRow}
            renderLeftHiddenRow={()=>false}
            renderRightHiddenRow={this._renderRightHiddenRow}
            renderSectionHeader={this._renderSectionHeader}
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
    deleteSurvey: (index) => dispatch(deleteSurvey(index))
  };
}

const mapStateToProps = state => ({
  surveys: (state.survey && state.survey.surveys) || [],
  navigation: state.cardNavigation,
  themeState: state.drawer.themeState,
});

export default connect(mapStateToProps, bindAction)(ActivityScreen);
