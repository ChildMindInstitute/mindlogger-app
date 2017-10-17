
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions } from 'react-native-navigation-redux-helpers';
import { ListView } from 'react-native';
import { Container, Header, Title, Content, Button, Icon, List, ListItem, Text , Left, Body, Right, ActionSheet, View } from 'native-base';
import { Actions } from 'react-native-router-flux';

import { openDrawer, closeDrawer } from '../../actions/drawer';

import styles from './styles';
const {
  pushRoute,
} = actions;

const sankhadeep = require('../../../img/contacts/sankhadeep.png');
const supriya = require('../../../img/contacts/supriya.png');
const himanshu = require('../../../img/contacts/himanshu.png');
const shweta = require('../../../img/contacts/shweta.png');
const shruti = require('../../../img/contacts/shruti.png');

var BUTTONS = ["Basic Survey", "Table Survey", "Voice", "Drawing", "Cancel"];

const datas = [
  {
    img: sankhadeep,
    text: 'Sankhadeep',
    note: 'Its time to build a difference . .',
  },
  {
    img: supriya,
    text: 'Supriya',
    note: 'One needs courage to be happy and smiling all time . . ',
  },
  {
    img: himanshu,
    text: 'Himanshu',
    note: 'Live a life style that matchs your vision',
  },
  {
    img: shweta,
    text: 'Shweta',
    note: 'Failure is temporary, giving up makes it permanent',
  },
  {
    img: shruti,
    text: 'Shruti',
    note: 'The biggest risk is a missed opportunity !!',
  },
];

const {
  popRoute,
} = actions;

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
        if(buttonIndex == 0) {
          this.pushRoute('survey_basic_add')
        }
      }
    )
  }
  
  _renderRow = (data) => {
    let swipeBtns = [
      {
        text: 'Edit',
        backgroundColor: 'blue',
        onPress: () => { this.editActivity(data)}
      },
      {
        text: 'Delete',
        backgroundColor: 'red',
        onPress: () => { this.deleteActivity(data)}
      }
    ]
    return (
    <ListItem>
      <Body>
        <Text>{data.text}</Text>
        <Text numberOfLines={1} note>{data.note}</Text>
      </Body>
    </ListItem>
    )
  }

  _renderRightHiddenRow = (data, secId, rowId, rowMap) => {
    return (
      <View style={{flexDirection:'row', height:63}}>
        <Button full info style={{height:63, width: 60}} onPress={_ => this.deleteRow(secId, rowId, rowMap)}>
          <Icon active name="build" />
        </Button>
        <Button full danger style={{height:63, width: 60}} onPress={_ => this.deleteRow(secId, rowId, rowMap)}>
          <Icon active name="trash" />
        </Button>
      </View>
  )
  }
  

  render() {
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    return (
      <Container style={styles.container}>
        <Header>
          <Left>
            <Button transparent onPress={this.props.openDrawer}>
              <Icon name="menu" />
            </Button>
          </Left>
          <Body>
            <Title>List</Title>
          </Body>
          <Right>
            <Button transparent onPress={() => this.promptToAddActivity()}>
              <Icon name="add" />
            </Button>
          </Right>
        </Header>

        <Content>
          <List
            dataSource={ds.cloneWithRows(datas)}
            renderRow={this._renderRow}
            renderLeftHiddenRow={()=>false}
            renderRightHiddenRow={this._renderRightHiddenRow}
            rightOpenValue={-120}
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
  };
}

const mapStateToProps = state => ({
  navigation: state.cardNavigation,
  themeState: state.drawer.themeState,
});

export default connect(mapStateToProps, bindAction)(ActivityScreen);
