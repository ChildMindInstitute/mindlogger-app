import React from 'react';
import {
  Container,
  Header,
  View,
  Content,
  List,
  ListItem,
  Text,
  Title,
  Icon,
  Button,
  Left,
  Right,
  Body,
} from 'native-base';
import { Actions } from 'react-native-router-flux';
import { Switch, Platform, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import AwesomeAlert from 'react-native-awesome-alerts';
import i18n from 'i18next';
import { skinSelector, mobileDataAllowedSelector } from '../../state/app/app.selectors';
import { toggleMobileDataAllowed, setLanguage } from '../../state/app/app.actions';
import { logout, removeAccount } from '../../state/app/app.thunks';
import { userInfoSelector } from '../../state/user/user.selectors';

import { setApplicationLanguage } from '../../i18n/i18n';

import { colors } from '../../themes/colors';

/* STYLES */
import styles from './styles';

const IOSHeaderPadding = Platform.OS === 'ios' ? '3.5%' : 0;
const IOSBodyPadding = Platform.OS === 'ios' ? 9 : 0;

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

    if (currentTime - this.onPressTime > 750) {
      Actions.push('change_password');
      this.onPressTime = currentTime;
    }
  };

  showAlert = () => {
    this.setState({
      showAlert: true,
    });
  };

  hideAlert = () => {
    this.setState({
      showAlert: false,
    });
  };

  render() {
    const {
      skin,
      mobileDataAllowed,
      toggleMobileDataAllowed,
      logout,
      userInfo,
      removeAccount,
    } = this.props;
    const { showAlert } = this.state;

    return (
      <Container>
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
            <Title>{i18n.t('settings:user_settings')}</Title>
          </Body>
          <Right />
        </Header>
        <Content>
          {userInfo ? (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                alignContent: 'center',
                padding: 10,
              }}
            >
              {/* { userInfo.image ? <Text>{userInfo.image}</Text> :
              <Icon type="FontAwesome" name="user-circle" style={{ fontSize: 54, padding: 10, color: colors.tertiary }} /> } */}
              <Icon
                type="FontAwesome"
                name="user-circle"
                style={{
                  fontSize: 54,
                  padding: 10,
                  color: colors.tertiary,
                }}
              />
              <Text>
                {userInfo.firstName} {userInfo.lastName}
              </Text>
              <Text style={{ fontWeight: 'bold' }}>{userInfo.login}</Text>
            </View>
          ) : (
            <Text>{i18n.t('settings:logged_out')}</Text>
          )}

          <List>
            <ListItem button bordered onPress={this.onPressChange}>
              <Left>
                <Text>{i18n.t('settings:change_pass')}</Text>
              </Left>
              <Right>
                <Icon name="arrow-forward" />
              </Right>
            </ListItem>

            <ListItem button bordered onPress={() => Actions.app_language()}>
              <Left>
                <Text>{i18n.t('language_screen:change_app_language')}</Text>
              </Left>
              <Right>
                <Icon name="arrow-forward" />
              </Right>
            </ListItem>

            {/* <ListItem button bordered> */}
            {/*  <Left> */}
            {/*    <Text>{i18n.t('settings:use_cellular_data')}</Text> */}
            {/*  </Left> */}
            {/*  <Right> */}
            {/*    <Switch onValueChange={toggleMobileDataAllowed} value={mobileDataAllowed} /> */}
            {/*  </Right> */}
            {/* </ListItem> */}
            <ListItem button bordered onPress={() => logout()}>
              <Left>
                <Text>{i18n.t('settings:logout')}</Text>
              </Left>
              <Right>
                <Icon name="key" />
              </Right>
            </ListItem>
            {/* <ListItem button bordered onPress={() => this.showAlert()}>
              <Left>
                <Text>{i18n.t('settings:permanently_delete_account')}</Text>
              </Left>
              <Right>
                <Icon name="trash" />
              </Right>
            </ListItem> */}
          </List>
        </Content>
        <AwesomeAlert
          show={showAlert}
          showProgress={false}
          title={i18n.t('additional:sure_delete_account_data')}
          message={i18n.t('applet_settings:alert_message')}
          closeOnHardwareBackPress={false}
          showCancelButton
          showConfirmButton
          cancelText={i18n.t('additional:no_cancel')}
          confirmText={i18n.t('additional:yes_delete')}
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
  appLanguage: state.app.appLanguage,
});

const mapDispatchToProps = dispatch => ({
  toggleMobileDataAllowed,
  logout: () => dispatch(logout()),
  removeAccount: () => dispatch(removeAccount()),
  setAppLanguage: lng => dispatch(setLanguage(lng)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SettingsScreen);
