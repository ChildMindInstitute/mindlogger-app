
const React = require('react-native');

const { StyleSheet, Dimensions, Platform } = React;

const deviceHeight = Dimensions.get('window').height;

export default {
  container: {
    
  },
  content: {
    padding: 36,
  },
  text: {
    fontSize: 14,
  },

  buttons: {
    padding: 36,
    fontSize: 18,
    justifyContent: 'center',
    height: '80%',
  },
  
  button:{
    alignSelf: 'center',
    marginTop: 36,
    width: 'auto',
    height: 40,
    backgroundColor: '#FFFFFF',
  },
  buttonText: {
    color: '#0067A0',
    fontSize: 20,
  },
  logo: {
    marginTop: 14,
    height: 63,
    width: 78,
    resizeMode: 'contain',
    alignSelf: 'center',
  }
};
