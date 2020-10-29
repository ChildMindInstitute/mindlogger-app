import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Image } from 'react-native';
import { connect } from 'react-redux';
import {
  Content,
  Text,
  List,
  ListItem,
  Container,
  Left,
  Header,
  Body,
  Title,
  Icon,
} from 'native-base';
import { Actions } from 'react-native-router-flux';
import i18n from 'i18next';
import styles from './style';
import { logout } from '../../state/app/app.thunks';
import { skinSelector } from '../../state/app/app.selectors';

const sidebarData = [
  {
    name: i18n.t('sidebar:home'),
    route: 'applet_list',
    icon: 'home',
    type: 'FontAwesome',
    image: require('../../../img/menu/diagram.png'),
  },
  {
    name: i18n.t('sidebar:settings'),
    route: 'settings',
    icon: 'gear',
    type: 'FontAwesome',
    image: require('../../../img/menu/settings.png'),
  },
  {
    name: i18n.t('sidebar:about'),
    route: 'about',
    icon: 'question',
    type: 'FontAwesome',
    image: require('../../../img/menu/info.png'),
  },
  {
    name: i18n.t('sidebar:logout'),
    route: 'logout',
    icon: 'sign-out',
    type: 'FontAwesome',
    image: require('../../../img/menu/logout.png'),
  },
];

const defaultLogo = require('../../../img/color_logo.png');

class SideBar extends Component {
  onMenu = (route) => {
    const { logout } = this.props;
    if (route === 'logout') {
      logout();
    } else {
      Actions.replace(route);
    }
    Actions.drawerClose();
  };

  render() {
    const { skin } = this.props;
    const title = skin.name;
    const logo = typeof skin.logo !== 'undefined' ? { uri: skin.logo } : defaultLogo;
    return (
      <Container>
        <Content bounces={false} style={styles.content}>
          <Header style={{ backgroundColor: skin.colors.primary }}>
            <Body>
              <Title>{title}</Title>
            </Body>
          </Header>
          <List
            style={styles.drawerList}
            dataArray={sidebarData}
            renderRow={data => (
              <ListItem button noBorder onPress={() => this.onMenu(data.route)}>
                <Left style={styles.drawerItem}>
                  <Icon type={data.type} name={data.icon} />
                  <Text style={styles.text}>{data.name}</Text>
                </Left>
              </ListItem>
            )}
          />
          <Image square style={styles.drawerLogo} source={logo} />
        </Content>
      </Container>
    );
  }
}

SideBar.propTypes = {
  skin: PropTypes.object.isRequired,
  logout: PropTypes.func.isRequired,
};

const bindAction = {
  logout,
};

const mapStateToProps = state => ({
  skin: skinSelector(state),
});

export default connect(
  mapStateToProps,
  bindAction,
)(SideBar);
