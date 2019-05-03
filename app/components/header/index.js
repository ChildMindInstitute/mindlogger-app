import React from 'react';
import PropTypes from 'prop-types';
import {Header, Left, Right, Body, Button, Title, Icon } from 'native-base';
import { Actions } from 'react-native-router-flux';

const ActHeader = ({ title, onInfo }) => (
  <Header>
    <Left>
      <Button transparent onPress={Actions.drawerOpen}>
        <Icon name="menu" />
      </Button>
    </Left>
    <Body style={{ flex: 2 }}>
      <Title>{title}</Title>
    </Body>
    <Right>
      {onInfo && (
        <Button transparent onPress={onInfo}>
          <Icon name="information-circle" />
        </Button>
      )}
    </Right>
  </Header>
);

ActHeader.propTypes = {
  title: PropTypes.string.isRequired,
  onInfo: PropTypes.func.isRequired,
};

export default ActHeader;
