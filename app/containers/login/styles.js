
const React = require('react-native');

const { StyleSheet, Dimensions, Platform } = React;

const deviceHeight = Dimensions.get('window').height;

export default {
  container: {
    flex: 1,
    width: null,
    height: null,
    backgroundColor: '#5555aa',
    padding: 20,
  },
  header: {
    height: 100
  },
  text: {
    color: '#D8D8D8',
  },
  rightText: {
    color: '#D8D8D8',
    textAlign:'right'
  },
  consentRow: {
    height: 'auto',
    marginTop: 10,
    marginBottom: 10,
  },
  consentRowText: {
    color: '#D8D8D8',
    marginLeft: 20,
  },
  boldText: {
    color: '#D8D8D8',
    fontWeight: 'bold',
    alignItems: 'center'
  },
  button:{
    alignSelf: 'center',
    marginTop: 20
  },
  bottomRow:{
    marginTop: 80
  }
};
