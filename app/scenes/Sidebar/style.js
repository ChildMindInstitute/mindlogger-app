import { colors } from '../../theme';

const React = require('react-native');

const { Platform } = React;

export default {
  content: {
    flex: 1,
    backgroundColor:
    '#fff',
    top: -1,
  },
  drawerList: {
    marginLeft: 20,
    marginTop: 20,
  },
  drawerItem: {
    alignItems: 'center',
  },
  drawerLogo: {
    marginTop: 40,
    alignSelf: 'center',
    width: 94,
    height: 79,
    resizeMode: 'contain',
  },
  text: {
    fontWeight: '300',
    fontSize: 20,
    marginLeft: 20,
  },
  badge: {
    borderRadius: 3,
    height: 25,
    width: 72,
  },
  badgeText: {
    fontSize: (Platform.OS === 'ios') ? 13 : 11,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: (Platform.OS === 'android') ? -3 : undefined,
  },
};
