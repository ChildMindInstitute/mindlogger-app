import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ImageBackground, Image, Platform } from 'react-native';
import { Actions } from 'react-native-router-flux';

import {Header, Left, Right, Body, Button, Title, Icon, Container } from 'native-base';

class InfoHeader extends Component {
  static propTypes = {
    title: PropTypes.string,
  }

  constructor(props) {
    super(props);
    this.state = {
      shadowOffsetWidth: 1,
      shadowRadius: 4,
    };
  }

  onClose = () => {
    Actions.pop();
  }

  render() {
    const { title } = this.props;
    return (
      <Container>
        <Header>
          <Left>
            <Button transparent onPress={this.onClose}>
              <Icon type="FontAwesome" name="close" />
            </Button>
          </Left>
          <Body style={{flex:2}}>
              <Title>{title}</Title>
          </Body>
          <Right>
            
          </Right>
        </Header>
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  
})

const mapDispatchToProps = {
  
}

export default connect(mapStateToProps, mapDispatchToProps)(InfoHeader)
