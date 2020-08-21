import React from 'react';
import { Container, Header, View, Content, List, ListItem, Text, Title, Icon, Button, Left, Right, Body } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { Switch } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import AwesomeAlert from 'react-native-awesome-alerts';
import { skinSelector, mobileDataAllowedSelector } from '../../state/app/app.selectors';
import { toggleMobileDataAllowed } from '../../state/app/app.actions';
import { logout, removeAccount } from '../../state/app/app.thunks';
import { userInfoSelector } from '../../state/user/user.selectors';

import { colors } from '../../themes/colors';

// eslint-disable-next-line
class SettingsScreen extends React.Component {
  constructor(props) {
    super(props);

    this.onPressTime = 0;
    this.state = {
      showAlert: false,
      // onPressTime: 0,
    };
  }

  onPressChange = () => {
    const currentTime = Date.now();

    if (currentTime - this.onPressTime > 350) {
      Actions.push('change_password');
    }
  }

  showAlert = () => {
    this.setState({
      showAlert: true,
    });
  }

  hideAlert = () => {
    this.setState({
      showAlert: false,
    });
  }

  render() {
    const { skin, mobileDataAllowed, toggleMobileDataAllowed, logout, userInfo, removeAccount } = this.props;
    const { showAlert } = this.state;

    return (
      <Container>
        <Header style={{ backgroundColor: skin.colors.primary }}>
          <Left>
            <Button transparent onPress={Actions.pop}>
              <Icon
                ios="ios-arrow-back"
                android="md-arrow-back"
              />
            </Button>
          </Left>
          <Body>
            <Title>User Settings</Title>
          </Body>
          <Right />
        </Header>
        <Content>
          { userInfo ? (
            <View style={{ justifyContent: 'center', alignItems: 'center', alignContent: 'center', padding: 10 }}>
              {/* { userInfo.image ? <Text>{userInfo.image}</Text> :
              <Icon type="FontAwesome" name="user-circle" style={{ fontSize: 54, padding: 10, color: colors.tertiary }} /> } */}
              <Icon type="FontAwesome" name="user-circle" style={{ fontSize: 54, padding: 10, color: colors.tertiary }} />
              <Text>{userInfo.firstName} {userInfo.lastName}</Text>
              <Text style={{ fontWeight: 'bold' }}>{userInfo.login}</Text>
            </View>
          ) : <Text>You've logged out.</Text>
          }

          <List>
            <ListItem
              button
              bordered
              onPress={this.onPressChange}
            >
              <Left>
                <Text>Change Password</Text>
              </Left>
              <Right>
                <Icon name="arrow-forward" />
              </Right>
            </ListItem>
            <ListItem
              button
              bordered
            >
              <Left>
                <Text>Use Cellular Data</Text>
              </Left>
              <Right>
                <Switch
                  onValueChange={toggleMobileDataAllowed}
                  value={mobileDataAllowed}
                />
              </Right>
            </ListItem>
            <ListItem
              button
              bordered
              onPress={() => logout()}
            >
              <Left>
                <Text>Logout</Text>
              </Left>
              <Right>
                <Icon name="key" />
              </Right>
            </ListItem>
            <ListItem
              button
              bordered
              onPress={() => this.showAlert()}
            >
              <Left>
                <Text>Permanently Delete Account</Text>
              </Left>
              <Right>
                <Icon name="trash" />
              </Right>
            </ListItem>
          </List>

        </Content>
        <AwesomeAlert
          show={showAlert}
          showProgress={false}
          title="Are you sure you want to delete your account and data?"
          message="You won't be able to recover it"
          closeOnHardwareBackPress={false}
          showCancelButton
          showConfirmButton
          cancelText="No, cancel"
          confirmText="Yes, delete it"
          confirmButtonColor="#DD6B55"
          onCancelPressed={() => {
            this.hideAlert();
          }}
          onConfirmPressed={() => {
            // TODO: add function that deletes the data
            // & routes you back to applet list view
            removeAccount();
            this.hideAlert();
          }}
        />
      </Container>
    );
  }
}

SettingsScreen.propTypes = {
  skin: PropTypes.object.isRequired,
  mobileDataAllowed: PropTypes.bool.isRequired,
  toggleMobileDataAllowed: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  removeAccount: PropTypes.func.isRequired,
  userInfo: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  skin: skinSelector(state),
  mobileDataAllowed: mobileDataAllowedSelector(state),
  userInfo: userInfoSelector(state),
});

const mapDispatchToProps = dispatch => ({
  toggleMobileDataAllowed,
  logout: () => dispatch(logout()),
  removeAccount: () => dispatch(removeAccount()),
});

export default connect(mapStateToProps, mapDispatchToProps)(SettingsScreen);
