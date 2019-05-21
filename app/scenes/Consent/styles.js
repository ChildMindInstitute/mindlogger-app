import { colors } from '../../theme';

export default {
  container: {
    flex: 1,
    width: null,
    height: null,
    backgroundColor: colors.primary,
    paddingTop: 20,
    paddingLeft: 50,
    paddingRight: 50,
  },
  container2: {
    flex: 1,
    width: null,
    height: null,
    backgroundColor: colors.primary,
    paddingTop: 40,
    paddingLeft: 50,
    paddingRight: 50,
  },
  header: {
    marginTop: 60,
    height: 100,
    fontSize: 40,
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
    fontSize: 16,
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
    color: colors.primary,
    fontSize: 20,
  },
  bottomRow:{
    marginTop: 20,
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
