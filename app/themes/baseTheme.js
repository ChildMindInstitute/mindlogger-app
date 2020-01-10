import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

const styles = {
  content: {
    flex: 1,
    width: null,
    height: null,
    backgroundColor: '#fff',
  },
  view: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  centerRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  centerCol: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  spacedRow: {
    alignSelf: 'stretch',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  paddingView: {
    padding: 20,
  },
};

export default styles;
