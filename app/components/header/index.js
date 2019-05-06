import React from 'react';
import PropTypes from 'prop-types';
import {Header, Left, Right, Body, Button, Title, Icon } from 'native-base';
import { Actions } from 'react-native-router-flux';

const ActHeader = ({ title, onInfo }) => (
  <Header>
    <Left />
    <Body style={{ flex: 2 }}>
      <Title>{title}</Title>
    </Body>
    <Right>
      <Button transparent onPress={Actions.pop}>
        <Icon name="close" />
      </Button>
    </Right>
  </Header>
);

ActHeader.propTypes = {
  title: PropTypes.string.isRequired,
  onInfo: PropTypes.func,
};

export default ActHeader;
