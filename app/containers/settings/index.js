
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import { ListView } from 'react-native';
import { Container, Header, Title, Content, Button, Icon, Form, Toast, List, ListItem, Text , Left, Body, Right, ActionSheet, View, Separator, SwipeRow } from 'native-base';
import { Actions } from 'react-native-router-flux';
import {reduxForm, Field} from 'redux-form';

import {FormInputItem, FormSwitchItem, FormRadioButtonGroup} from '../../components/form/FormItem'
import { auth, base} from '../../firebase'
import {updateUserProfile, updateUserPassword} from '../../actions/api';
import {updateUserLocal} from '../../actions/coreActions';
import { openDrawer, closeDrawer } from '../../actions/drawer';

import styles from './styles';

class UserForm extends Component {
    onRegister = () => {
        Actions.consent()
    }
    render() {
        const { handleSubmit, onSubmit, submitting, initialValues, onForgot, user } = this.props;
        return (
            <Form>
                <Field component={FormInputItem} label="Full name" name="displayName" placeholder={user.displayName} style={styles.text} floatingLabel />
                <Field component={FormInputItem} label="Password" name="password" style={styles.text} floatingLabel secureTextEntry={true}/>
                <Field name="role"
                component ={FormRadioButtonGroup}
                options   ={[
                  {text:"Patient",value:"patient"},
                  {text:"Clinician",value:"clinician"},
                ]} />
                <Button
                    block
                    style={{marginTop: 40}}
                    onPress={handleSubmit(onSubmit)}>
                    <Text>Update</Text>
                </Button>
            </Form>
        )
    }
}

UserReduxForm = reduxForm({
    form: 'user-form'
})(UserForm)


class SettingScreen extends Component {

  static propTypes = {
    openDrawer: PropTypes.func,
  }

  componentWillMount() {
    const {user, surveys, loadSurveys} = this.props;
    base.syncState(`users/${user.uid}`, {
      context: this,
      state: 'userInfo'
    });
  }

  pushRoute(route) {
    console.log(route)
    Actions[route]()
  }

  popRoute() {
    Actions.pop()
  }

  onUserSubmit = ({displayName, password, role}) => {
    const {user, updateUserProfile, updateUserPassword, updateUserLocal} = this.props
    let arr = []
    if(displayName != user.displayName) {
        arr.push(updateUserProfile({displayName}))
    }
    if(password && password.length>0 && user.password != password) {
        arr.push(updateUserPassword(password))
    }
    if(role) {
        this.setState({userInfo:{role, name: displayName}})
        updateUserLocal({role})
    }
    if(arr.length > 0) {
      Promise.all(arr).then(result => {
        Toast.show({text:'Success', position: 'bottom', type:'success', duration:1000})
      }).catch(error => {
        Toast.show({text: error.message, position: 'bottom', type:'danger', buttonText: 'OK'})
      })
    } else {
      Toast.show({text:'Success', position: 'bottom', type:'success', duration:1000})
    }
  }

  render() {
    const {user} = this.props
    let data = {...user, ...this.state.userInfo}
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
          </Right>
        </Header>

        <Content padder>
            <UserReduxForm onSubmit={this.onUserSubmit} initialValues={data} user={user} />
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
    ...bindActionCreators({updateUserProfile, updateUserPassword, updateUserLocal}, dispatch)
  };
}

const mapStateToProps = state => ({
  drawings: (state.drawing && state.drawing.drawings) || [],
  themeState: state.drawer.themeState,
  user: (state.core && state.core.user)
});

export default connect(mapStateToProps, bindAction)(SettingScreen);
