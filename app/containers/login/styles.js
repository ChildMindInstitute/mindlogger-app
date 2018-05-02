
const React = require('react-native');

const { StyleSheet, Dimensions, Platform } = React;

const deviceHeight = Dimensions.get('window').height;

export default {
  container: {
    flex: 1,
    width: null,
    height: null,
    backgroundColor: '#0067A0',
    paddingTop: 20,
    paddingLeft: 50,
    paddingRight: 50,
  },
  header: {
    marginTop: 60,
    height: 100,
    fontSize: 48,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 20,
    // textAlign: 'center',
  },
  whiteText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 45,
    padding: 0,
    textAlign: 'center',
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
    marginTop: 36,
    width: 'auto',
    height: 40,
    backgroundColor: '#FFFFFF',
  },
  buttonText: {
    color: '#0067A0',
    fontSize: 20,
  },
  bottomRow:{
    marginTop: 60,
    flexDirection:'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutButton: {
    marginTop: 20,
    justifyContent: 'center',
  },
  logo: {
    height: 63,
    width: 78,
    resizeMode: 'contain',
    alignSelf: 'center',
  }
};
