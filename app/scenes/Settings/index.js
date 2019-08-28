import React from 'react';
import { Container, Header, View, Content, List, ListItem, Text, Title, Icon, Button, Left, Right, Body } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { Switch } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import AwesomeAlert from 'react-native-awesome-alerts';
import { skinSelector, mobileDataAllowedSelector } from '../../state/app/app.selectors';
import { toggleMobileDataAllowed } from '../../state/app/app.actions';
import { logout } from '../../state/app/app.thunks';
import { userInfoSelector } from '../../state/user/user.selectors';
import { colors } from '../../themes/colors';

// eslint-disable-next-line
class SettingsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { showAlert: false };
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
    const { skin, mobileDataAllowed, toggleMobileDataAllowed, logout, userInfo } = this.props;
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
          <View style={{ justifyContent: 'center', alignItems: 'center', alignContent: 'center', padding: 10 }}>
            { userInfo.image ? <Text>{userInfo.image}</Text> : <Icon type="FontAwesome" name="user-circle" style={{ fontSize: 54, padding: 10, color: colors.tertiary }} /> }
            <Text>{userInfo.firstName} {userInfo.lastName}</Text>
            <Text style={{ fontWeight: 'bold' }}>{userInfo.login}</Text>
          </View>
          <List>
            <ListItem button bordered onPress={() => Actions.push('change_password')}>
              <Left>
                <Text>Change Password</Text>
              </Left>
              <Right>
                <Icon name="arrow-forward" />
              </Right>
            </ListItem>
            <ListItem bordered>
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
            <ListItem onPress={() => {
              logout();
            }}
            >
              <Left>
                <Text> Logout </Text>
              </Left>
              <Right>
                <Icon name="arrow-forward" />
              </Right>
            </ListItem>
          </List>
          <View style={{ padding: 10 }}>
            <Text style={{ margin: 20 }}>
              If you want to delete your data from this applet and remove it, click below.
            </Text>
            <Button
              rounded
              full
              danger
              style={{ borderRadius: 50 }}
              onPress={() => this.showAlert()}
            >
              <Text style={{ fontWeight: 'bold' }}>Delete your Account & Data</Text>
            </Button>
          </View>

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
});

export default connect(mapStateToProps, mapDispatchToProps)(SettingsScreen);
