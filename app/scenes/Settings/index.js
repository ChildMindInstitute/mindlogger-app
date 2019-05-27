import React from 'react';
import { Container, Header, Content, List, ListItem, Text, Title, Icon, Button, Left, Right, Body } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { Switch } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { skinSelector, mobileDataAllowedSelector } from '../../state/app/app.selectors';
import { toggleMobileDataAllowed } from '../../state/app/app.actions';


const SettingsScreen = ({ skin, mobileDataAllowed, toggleMobileDataAllowed }) => (
  <Container>
    <Header style={{ backgroundColor: skin.colors.primary }}>
      <Left />
      <Body>
        <Title>Settings</Title>
      </Body>
      <Right>
        <Button transparent onPress={Actions.drawerOpen}>
          <Icon type="FontAwesome" name="bars" />
        </Button>
      </Right>
    </Header>
    <Content>
      <List>
        <ListItem button bordered onPress={() => Actions.replace('change_password')}>
          <Left>
            <Text>Change Password</Text>
          </Left>
          <Right>
            <Icon name="arrow-forward" />
          </Right>
        </ListItem>
        <ListItem bordered>
          <Left>
            <Text>Use Mobile Data</Text>
          </Left>
          <Right>
            <Switch
              onValueChange={toggleMobileDataAllowed}
              value={mobileDataAllowed}
            />
          </Right>
        </ListItem>
      </List>
    </Content>
  </Container>
);

SettingsScreen.propTypes = {
  skin: PropTypes.object.isRequired,
  mobileDataAllowed: PropTypes.bool.isRequired,
  toggleMobileDataAllowed: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  skin: skinSelector(state),
  mobileDataAllowed: mobileDataAllowedSelector(state),
});

const mapDispatchToProps = {
  toggleMobileDataAllowed,
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsScreen);
