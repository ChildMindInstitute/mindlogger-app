import React from 'react';
import { Container, Header, Content, List, ListItem, Text, Title, Icon, Button, Left, Right, Body } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { Switch } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { skinSelector, mobileDataAllowedSelector } from '../../state/app/app.selectors';
import { toggleMobileDataAllowed } from '../../state/app/app.actions';
import { logout } from '../../state/app/app.thunks';

// eslint-disable-next-line
class SettingsScreen extends React.Component {
  render() {
    const { skin, mobileDataAllowed, toggleMobileDataAllowed, logout } = this.props;
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
        </Content>
      </Container>
    );
  }
}

SettingsScreen.propTypes = {
  skin: PropTypes.object.isRequired,
  mobileDataAllowed: PropTypes.bool.isRequired,
  toggleMobileDataAllowed: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  skin: skinSelector(state),
  mobileDataAllowed: mobileDataAllowedSelector(state),
});

const mapDispatchToProps = dispatch => ({
  toggleMobileDataAllowed,
  logout: () => dispatch(logout()),
});

export default connect(mapStateToProps, mapDispatchToProps)(SettingsScreen);
