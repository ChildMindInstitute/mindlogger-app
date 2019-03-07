
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import { ListView } from 'react-native';
import { Container, Header, Title, Content, Button, Icon, Form, Toast, List, ListItem, Text , Left, Body, Right, ActionSheet, View, Separator, SwipeRow } from 'native-base';
import { Actions } from 'react-native-router-flux';
import {reduxForm, Field, SubmissionError} from 'redux-form';

import {FormInputItem, FormSwitchItem, FormRadioButtonGroup} from '../../components/form/FormItem'
import {updateUser, changePassword} from '../../actions/api';
import {updateUserLocal} from '../../actions/coreActions';
import { openDrawer, closeDrawer } from '../../actions/drawer';

import styles from './styles';

class UserForm extends Component {
    onRegister = () => {
        Actions.consent()
    }

    render() {
        const { handleSubmit, onSubmit, submitting, initialValues, onForgot} = this.props;
        return (
            <Form>
                <Field component={FormInputItem} name="firstName" placeholder="First Name" style={styles.text}/>
                <Field component={FormInputItem} name="lastName" placeholder="Last Name" style={styles.text}/>
                <Field component={FormInputItem} placeholder="Current password" name="oldPassword" style={styles.text} secureTextEntry={true}/>
                <Field component={FormInputItem} placeholder="New password" name="password" style={styles.text} secureTextEntry={true}/>
                <Button
                  light
                  bordered
                  style={styles.button}
                  onPress={handleSubmit(onSubmit)}>
                  <Text>Update</Text>
                </Button>
            </Form>
        )
    }
}

UserReduxForm = reduxForm({
  form: 'user-form',
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
})(UserForm)


class SettingScreen extends Component {

  static propTypes = {
    openDrawer: PropTypes.func,
  }

  componentWillMount() {
    const {user, surveys, loadSurveys} = this.props;
  }

  pushRoute(route) {
    Actions[route]()
  }

  popRoute() {
    Actions.pop()
  }

  onUserSubmit = ({firstName, lastName, oldPassword, password}) => {
    const {user, updateUser, changePassword, updateUserLocal} = this.props
    let arr = []
    let body = {...user, firstName, lastName}
    arr.push(updateUser(user._id, body))
    if (password && password.length>0) {
      arr.push(changePassword(oldPassword, password))
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
    return (
      <Container style={styles.container}>
        <Header>
          <Left>
            <Button transparent onPress={this.props.openDrawer}>
              <Icon name="menu" />
            </Button>
          </Left>
          <Body>
            <Title>Settings</Title>
          </Body>
          <Right>
          </Right>
        </Header>

        <Content>
          <Text style={styles.subHeader}>Profile</Text>
          <View style={styles.subSection}>
            <UserReduxForm onSubmit={this.onUserSubmit} initialValues={user}/>
          </View>
          {/* <Text style={styles.subHeader}>Notification</Text> */}
          
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
    ...bindActionCreators({updateUser, changePassword, updateUserLocal}, dispatch)
  };
}

const mapStateToProps = state => ({
  user: (state.core && state.core.self)
});

export default connect(mapStateToProps, bindAction)(SettingScreen);
