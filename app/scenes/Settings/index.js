import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Container, Header, Title, Content, Button, Icon, Text, Left, Body, Right, View } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { SubmissionError } from 'redux-form';
import styles from './styles';
import { userInfoSelector, authTokenSelector } from '../../state/user/user.selectors';
import { updateUserDetails, updatePassword } from '../../services/network';
import { updateUserDetailsSuccessful } from '../../state/user/user.thunks';
import SettingsForm from './SettingsForm';

class SettingScreen extends Component {
  updateUser = (firstName, lastName) => {
    const { user, authToken, updateUserDetailsSuccessful } = this.props;
    return updateUserDetails(authToken, { id: user._id, email: user.email, firstName, lastName })
      .then(updateUserDetailsSuccessful)
      .catch(() => {
        throw new SubmissionError({
          _error: 'Unable to update user details.',
        });
      });
  }

  onSubmit = ({ firstName, lastName, oldPassword, password }) => {
    const { authToken } = this.props;
    if (password && oldPassword) {
      return updatePassword(authToken, oldPassword, password)
        .then(() => this.updateUser(firstName, lastName))
        .catch((e) => {
          console.log(e);
          throw new SubmissionError({
            _error: 'The current password you entered was incorrect.',
          });
        });
    }
    // No update password - just update the first name and last name
    return this.updateUser(firstName, lastName);
  }

  popRoute = () => {
    Actions.pop();
  };

  render() {
    const { user } = this.props;
    return (
      <Container style={styles.container}>
        <Header>
          <Left />
          <Body>
            <Title>Settings</Title>
          </Body>
          <Right>
            <Button transparent onPress={Actions.drawerOpen}>
              <Icon name="menu" />
            </Button>
          </Right>
        </Header>
        <Content>
          <Text style={styles.subHeader}>Profile</Text>
          <View style={styles.subSection}>
            <SettingsForm onSubmit={this.onSubmit} initialValues={user} />
          </View>
        </Content>
      </Container>
    );
  }
}

SettingScreen.propTypes = {
  user: PropTypes.object.isRequired,
  authToken: PropTypes.string.isRequired,
  updateUserDetailsSuccessful: PropTypes.func.isRequired,
};

const bindAction = {
  updateUserDetailsSuccessful,
};

const mapStateToProps = state => ({
  user: userInfoSelector(state),
  authToken: authTokenSelector(state),
});

export default connect(mapStateToProps, bindAction)(SettingScreen);
