import React from 'react';
import PropTypes from 'prop-types';
import {Header, Left, Right, Body, Button, Title, Icon } from 'native-base';
import { Actions } from 'react-native-router-flux';

const ActHeader = ({ title, onInfo }) => (
  <Header transparent style={{ backgroundColor: 'white', color: 'black', borderBottomWidth: 0, }}>
    <Left />
    <Body style={{ flex: 2 }}>
      {/* <Title style={{color:'lightgray'}}>{title}</Title> */}
    </Body>
    <Right>
      <Button transparent onPress={() => {Actions.pop()}}>
        <Icon type="FontAwesome" name="close" style={{color:'lightgray'}}/>
      </Button>
    </Right>
  </Header>
);

ActHeader.propTypes = {
  title: PropTypes.string.isRequired,
  onInfo: PropTypes.func,
};

export default ActHeader;
