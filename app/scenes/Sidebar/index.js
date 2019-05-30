import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Image } from 'react-native';
import { connect } from 'react-redux';
import { Content, Text, List, ListItem, Container, Left, Right, Badge, View, Header, Body, Title, Icon } from 'native-base';
import { Actions } from 'react-native-router-flux';
import styles from './style';
import { logout } from '../../state/app/app.thunks';
import { skinSelector } from '../../state/app/app.selectors';


const datas = [
  {
    name: 'Home',
    route: 'applet_list',
    icon: 'home',
    type: 'FontAwesome',
    image: require('../../../img/menu/diagram.png'),
    bg: '#C5F442',
  },
  {
    name: 'Settings',
    route: 'settings',
    icon: 'gear',
    type: 'FontAwesome',
    image: require('../../../img/menu/settings.png'),
    bg: '#DA4437',
  },
  {
    name: 'About',
    route: 'about',
    icon: 'question',
    type: 'FontAwesome',
    image: require('../../../img/menu/info.png'),
    bg: '#4DCAE0',
  },
  {
    name: 'Logout',
    route: 'logout',
    icon: 'sign-out',
    type: 'FontAwesome',
    image: require('../../../img/menu/logout.png'),
    bg: '#1EBC7C',
  },
];

const defaultLogo = require('../../../img/color_logo.png');

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
    const { skin } = this.props;
    const title = skin ? skin.name : 'MindLogger';
    const logo = (typeof skin.logo !== 'undefined') ? { uri: skin.logo } : defaultLogo;
    return (
      <Container>
        <Content
          bounces={false}
          style={{ flex: 1, backgroundColor: '#fff', top: -1 }}
        >
          <Header style={{ backgroundColor: skin.colors.primary }}>
            <Body>
              <Title>{title}</Title>
            </Body>
          </Header>
          <List style={styles.drawerList}
            dataArray={datas} renderRow={data =>
            <ListItem button noBorder onPress={() => this.onMenu(data.route)} >
              <Left>
                {/* <Image active source={data.image} style={styles.menuImage} /> */}
                <Icon type={data.type} name={data.icon} />
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
                source={logo}
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

const mapStateToProps = state => ({
  skin: skinSelector(state)
});

export default connect(mapStateToProps, bindAction)(SideBar);
