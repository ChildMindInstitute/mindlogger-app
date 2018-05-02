
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
        const { handleSubmit, onSubmit, submitting, initialValues, onForgot, user } = this.props;
        return (
            <Form>
                <Field component={FormInputItem} label="First name" name="first_name" placeholder={user.first_name} style={styles.text} floatingLabel />
                <Field component={FormInputItem} label="Last name" name="last_name" placeholder={user.last_name} style={styles.text} floatingLabel />
                <Field component={FormInputItem} label="Current password" name="current_password" style={styles.text} floatingLabel secureTextEntry={true}/>
                <Field component={FormInputItem} label="New password" name="new_password" style={styles.text} floatingLabel secureTextEntry={true}/>
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
    this.setState({user})
  }

  pushRoute(route) {
    console.log(route)
    Actions[route]()
  }

  popRoute() {
    Actions.pop()
  }

  onUserSubmit = ({first_name, last_name, current_password, new_password}) => {
    const {user, updateUser, changePassword, updateUserLocal} = this.props
    let arr = []
    let body = {first_name, last_name}
    arr.push(updateUser(body))
    if(new_password && new_password.length>0) {
      if(current_password == user.password)
        arr.push(changePassword({new_password, current_password}))
      else
        throw new SubmissionError({current_password: "Password does not match!"})
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
            <Title>Activities</Title>
          </Body>
          <Right>
          </Right>
        </Header>

        <Content padder>
            <UserReduxForm onSubmit={this.onUserSubmit} initialValues={user} user={user} />
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
  drawings: (state.drawing && state.drawing.drawings) || [],
  themeState: state.drawer.themeState,
  user: (state.core && state.core.auth)
});

export default connect(mapStateToProps, bindAction)(SettingScreen);
