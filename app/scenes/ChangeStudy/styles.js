import { colors } from '../../theme';

export default {
  formContainer: {
    paddingTop: 40,
    paddingLeft: 20,
    paddingRight: 20,
  },
  container: {
    flex: 1,
    backgroundColor: colors.primary,
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
    fontSize: 20,
  },
  button: {
    alignSelf: 'center',
    marginTop: 36,
    height: 40,
    width: 180,
    backgroundColor: colors.secondary,
  },
  headerButton: {
    alignSelf: 'center',
    height: 40,
    width: 180,
    backgroundColor: colors.secondary,
  },
  buttonText: {
    color: '#0067A0',
    fontSize: 20,
  },
};
