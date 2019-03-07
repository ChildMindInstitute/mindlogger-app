
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

  headerText: {
    marginBottom: 20,
  },

  boldText: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 8,
  },
  buttons: {
    alignItems: 'flex-start',
  },
  
  button:{
    marginTop: 10,
    paddingLeft: 0,
  },
  aboutLink: {
    flexDirection: 'row',
    color: '#0067A0',
    alignItems: 'center',
    marginBottom: 10,
  },
  aboutIcon: {
    color: '#0067A0',
    marginRight: 10,
  },
  buttonText: {
    color: '#0067A0',
    fontSize: 16,
  },
  logo: {
    marginTop: 14,
    height: 63,
    width: 78,
    resizeMode: 'contain',
    alignSelf: 'center',
  }
};
