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
  header: {
    marginTop: 60,
    height: 100,
    fontSize: 40,
    textAlign: 'center',
    color: colors.secondary,
  },
  text: {
    color: colors.secondary,
    fontSize: 20,
    // textAlign: 'center',
  },
  whiteText: {
    color: colors.secondary,
    fontSize: 16,
    marginBottom: 30,
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
    height: 40,
    width: 100,
    backgroundColor: colors.secondary,
  },
  buttonText: {
    color: '#0067A0',
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
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignContent: 'flex-end',
    backgroundColor: colors.primary,
  },
  logo: {
    height: 63,
    width: 78,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
};
