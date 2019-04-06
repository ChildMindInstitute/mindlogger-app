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
  text: {
    color: colors.secondary,
    fontSize: 20,
    // textAlign: 'center',
  },
  errorText: {
    color: colors.secondary,
    fontSize: 16,
    marginTop: 16,
    fontWeight: 'bold',
  },
  whiteText: {
    color: colors.secondary,
    fontSize: 16,
    marginBottom: 30,
    padding: 0,
    textAlign: 'center',
  },
  button: {
    alignSelf: 'center',
    marginTop: 36,
    height: 40,
    width: 180,
    backgroundColor: colors.secondary,
  },
  buttonText: {
    color: '#0067A0',
    fontSize: 20,
  },
};
