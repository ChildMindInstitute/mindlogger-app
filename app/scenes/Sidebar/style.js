
const React = require('react-native');

const { StyleSheet, Platform, Dimensions } = React;

const deviceHeight = Dimensions.get('window').height;
const deviceWidth = Dimensions.get('window').width;

export default {
  sidebar: {
    flex: 1,
    backgroundColor: '#fff',
  },
  drawerCover: {
    alignSelf: 'stretch',
    // resizeMode: 'cover',
    width: null,
    backgroundColor: '#0067A0',
    position: 'relative',
    marginBottom: 10,
    flexDirection: 'row',
  },
  drawerCoverText: {
    color: '#FFFFFF',
    width: '100%',
    fontSize: 24,
    alignSelf: 'center',
    textAlign: 'center',
  },
  drawerList: {
    marginLeft: 20,
    marginTop: 20,
  },
  menuImage: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  drawerLogo: {
    // left: (Platform.OS === 'android') ? 30 : 40,
    //top: (Platform.OS === 'android') ? deviceHeight / 13 : deviceHeight / 12,
    marginTop: 40,
    alignSelf: 'center',
    width: 94,
    height: 79,
    resizeMode: 'contain',
  },
  listItemContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  iconContainer: {
    width: 37,
    height: 37,
    borderRadius: 18,
    marginRight: 12,
    paddingTop: (Platform.OS === 'android') ? 7 : 5,
  },
  sidebarIcon: {
    fontSize: 18,
    color: '#fff',
    lineHeight: (Platform.OS === 'android') ? 21 : 25,
    backgroundColor: 'transparent',
    alignSelf: 'center',
  },
  text: {
    fontWeight: (Platform.OS === 'ios') ? '300' : '300',
    fontSize: 20,
    marginLeft: 20,
  },
  badgeText: {
    fontSize: (Platform.OS === 'ios') ? 13 : 11,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: (Platform.OS === 'android') ? -3 : undefined,
  },
};
