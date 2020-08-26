import React, { Component } from 'react';
import { StatusBar, Platform } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Container, Header, Title, Content, Button, Icon, Text, Left, Body, Right, View } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { SubmissionError } from 'redux-form';
import styles from './styles';
import { userInfoSelector, authTokenSelector } from '../../state/user/user.selectors';
import { updateUserDetails, updatePassword } from '../../services/network';
import { skinSelector } from '../../state/app/app.selectors';
import { updateUserDetailsSuccessful } from '../../state/user/user.thunks';
import ChangePasswordForm from './ChangePasswordForm';

const IOSHeaderPadding = Platform.OS === 'ios' ? '3.5%' : 0;
const IOSBodyPadding = Platform.OS === 'ios' ? 9 : 0;

class ChangePasswordScreen extends Component {
  updateUser = (firstName, lastName) => {
    const { user, authToken, updateUserDetailsSuccessful } = this.props;
    return updateUserDetails(authToken, { id: user._id, email: user.email, firstName, lastName })
      .then(() => {
        user.firstName = firstName;
        user.displayName = firstName;
        updateUserDetailsSuccessful(user);
      })
      .catch(() => {
        throw new SubmissionError({
          _error: 'Unable to update user details.',
        });
      });
  }

  onSubmit = ({ oldPassword, password }) => {
    const { authToken } = this.props;
    return updatePassword(authToken, oldPassword, password)
      .then(() => {})
      .catch((e) => {
        throw new SubmissionError({
          _error: 'The current password you entered was incorrect.',
        });
      });
  // No update password - just update the first name and last name
  }

  popRoute = () => {
    Actions.pop();
  };

  render() {
    const { user, skin } = this.props;
    return (
      <Container style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Header
          style={{
            backgroundColor: skin.colors.primary,
            paddingTop: IOSHeaderPadding,
          }}
        >
          <Left>
            <Button transparent onPress={Actions.pop}>
              <Icon ios="ios-arrow-back" android="md-arrow-back" />
            </Button>
          </Left>
          <Body style={{ paddingTop: IOSBodyPadding }}>
            <Title>Change Password</Title>
          </Body>
          <Right />
        </Header>
        <Content>
          <Text style={styles.subHeader}> </Text>
          <View style={styles.subSection}>
            <ChangePasswordForm
              onSubmit={this.onSubmit}
              initialValues={user}
              primaryColor={skin.colors.primary}
            />
          </View>
        </Content>
      </Container>
    );
  }
}

ChangePasswordScreen.propTypes = {
  user: PropTypes.object.isRequired,
  authToken: PropTypes.string.isRequired,
  updateUserDetailsSuccessful: PropTypes.func.isRequired,
  skin: PropTypes.object.isRequired,
};

const bindAction = {
  updateUserDetailsSuccessful,
};

const mapStateToProps = state => ({
  user: userInfoSelector(state),
  authToken: authTokenSelector(state),
  skin: skinSelector(state),
});

export default connect(mapStateToProps, bindAction)(ChangePasswordScreen);
