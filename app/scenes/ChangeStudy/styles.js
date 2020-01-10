import { colors } from '../../theme';

export default {
  container: {
    flex: 1,
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
  buttonContainer: {
    marginTop: 36,
    flexDirection: 'row',
  },
  button: {
    backgroundColor: colors.secondary,
    flex: 1,
    margin: 4,
  },
  buttonText: {
    fontSize: 18,
  },
};
