
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Image } from 'react-native';
import { connect } from 'react-redux';
import { Content, Text, List, ListItem, Container, Left, Right, Badge, View, Header, Body, Title } from 'native-base';
import { Actions } from 'react-native-router-flux';
import styles from './style';
import { logout } from '../../state/app/app.thunks';


const datas = [
  {
    name: 'Home',
    route: 'applet_list',
    image: require('../../../img/menu/diagram.png'),
    bg: '#C5F442',
  },
  {
    name: 'Settings',
    route: 'settings',
    image: require('../../../img/menu/settings.png'),
    bg: '#DA4437',
  },
  {
    name: 'About',
    route: 'about',
    icon: 'help-buoy',
    image: require('../../../img/menu/info.png'),
    bg: '#4DCAE0',
  },
  {
    name: 'Logout',
    route: 'logout',
    icon: 'log-out',
    image: require('../../../img/menu/logout.png'),
    bg: '#1EBC7C',
  },
];

const logoImage = require('../../../img/color_logo.png');
class SideBar extends Component {

  static propTypes = {
    changePlatform: PropTypes.func,
    changeMaterial: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {
      shadowOffsetWidth: 1,
      shadowRadius: 4,
    };
  }

  onMenu(route) {
    const { closeDrawer, logout } = this.props;
    if (route === 'logout') {
      logout();
    } else {
      Actions.replace(route);
    }
    Actions.drawerClose();
  }

  render() {
    return (
      <Container>
        <Content
          bounces={false}
          style={{ flex: 1, backgroundColor: '#fff', top: -1 }}
        >
          <Header>
            <Body>
              <Title>MindLogger</Title>
            </Body>
          </Header>
          <List style={styles.drawerList}
            dataArray={datas} renderRow={data =>
            <ListItem button noBorder onPress={() => this.onMenu(data.route)} >
              <Left>
                <Image active source={data.image} style={styles.menuImage} />
                <Text style={styles.text}>{data.name}</Text>
              </Left>
              {(data.types) &&
              <Right style={{ flex: 1 }}>
                <Badge
                  style={{ borderRadius: 3, height: 25, width: 72, backgroundColor: data.bg }}
                >
                  <Text style={styles.badgeText}>{`${data.types} Types`}</Text>
                </Badge>
              </Right>
              }
            </ListItem>}
          />
          <View>
            <Image
                square
                style={styles.drawerLogo}
                source={logoImage}
                />
          </View>

        </Content>
      </Container>
    );
  }
}

const bindAction = {
  logout,
};

export default connect(null, bindAction)(SideBar);
