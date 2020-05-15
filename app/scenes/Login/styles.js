import { colors } from '../../theme';

export default {
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    position: 'relative',
  },
  contentContainer: {
    padding: 50,
    minHeight: '100%',
    justifyContent: 'center',
  },
  header: {
    fontSize: 40,
    textAlign: 'center',
    color: colors.secondary,
    marginBottom: 15,
  },
  text: {
    color: colors.secondary,
    fontSize: 20,
  },
  whiteText: {
    color: colors.secondary,
    fontSize: 16,
    marginBottom: 16,
    padding: 0,
    textAlign: 'center',
  },
  whiteIcon: {
    color: colors.secondary,
    fontSize: 22,
    alignSelf: 'flex-end',
  },
  button: {
    alignSelf: 'center',
    marginTop: 36,
    marginBottom: 16,
    width: 'auto',
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 30,
    paddingRight: 30,
    minWidth: 140,
  },
  buttonText: {
    fontSize: 20,
  },
  bottomRow: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: 12,
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
  },
  forgotPassword: {
    marginLeft: 20,
  },
  logo: {
    marginTop: 20,
    height: 63,
    width: 78,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
};
