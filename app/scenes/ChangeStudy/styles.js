import { colors } from '../../theme';

export default {
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  formContainer: {
    paddingTop: 40,
    paddingLeft: 20,
    paddingRight: 20,
  },
  text: {
    color: colors.secondary,
    fontSize: 20,
  },
  errorText: {
    color: colors.secondary,
    fontSize: 16,
    marginTop: 16,
    fontWeight: 'bold',
  },
  button: {
    alignSelf: 'center',
    marginTop: 36,
    height: 40,
    width: 180,
    backgroundColor: colors.secondary,
  },
  buttonText: {
    color: colors.primary,
    fontSize: 20,
  },
};
