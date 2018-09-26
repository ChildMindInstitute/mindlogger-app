
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ImageBackground, Image, Platform } from 'react-native';
import { connect } from 'react-redux';
import { Content, Text, List, ListItem, Icon, Container, Left, Right, Badge, Button, View, StyleProvider, getTheme, variables } from 'native-base';
import { Actions } from 'react-native-router-flux';


class DrawerCheck extends Component {

  static propTypes = {

  }

  constructor(props) {
    super(props);
  }

  componentDidUpdate() {
    console.log(this.props.drawerState);
    if (this.props.drawerState === 'opened') {
      this.props.onOpenDrawer();
    }

    if (this.props.drawerState === 'closed') {
      this.props.onCloseDrawer();
    }
  }
  render() {
    return (
      <View>
      </View>
    );
  }
}

function bindAction(dispatch) {
  return {
  };
}

const mapStateToProps = state => ({
  drawerState: state.drawer.drawerState,
});

export default connect(mapStateToProps, bindAction)(DrawerCheck);
