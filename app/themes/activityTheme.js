import { StyleSheet } from 'react-native';
import theme from './base-theme';

const styles = StyleSheet.create({
  body: {
    flex: 1,
    fontFamily: theme.fontFamily,
  },
  camera: {
    width: '100%',
    height: 360,
    position: 'relative',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  footerText: {
    fontSize: 20,
    fontWeight: '300',
    fontFamily: theme.fontFamily,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '300',
    fontFamily: theme.fontFamily,
  },
  takeButton: {
    borderRadius: 12,
    width: '100%',
    height: 360,
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#d10000',
    backgroundColor: '#ffdddd',
    fontFamily: theme.fontFamily,
  },
  videoConfirmed: {
    borderRadius: 12,
    width: '100%',
    height: 360,
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#00a30a',
    backgroundColor: '#99ff9f',
    fontFamily: theme.fontFamily,
  },
  chooseButton: {
    borderRadius: 12,
    width: '100%',
    height: 116,
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#000000',
    backgroundColor: '#dbdbdb',
    marginTop: 8,
    fontFamily: theme.fontFamily,
  },
  redIcon: {
    color: '#d10000',
    fontSize: 60,
  },
  greenIcon: {
    color: '#00a30a',
    fontSize: 60,
  },
});

export const markdownStyle = {
  heading1: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 18,
    fontFamily: theme.fontFamily,
  },
  heading2: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 18,
    fontFamily: theme.fontFamily,
  },
  heading3: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 18,
    fontFamily: theme.fontFamily,
  },
  paragraph: {
    alignSelf: 'center',
    fontSize: 22,
    fontWeight: '300',
    color: '#000000',
    fontFamily: theme.fontFamily,
  },
  listItemUnorderedContent: {
    fontSize: 20,
    color: '#000000',
    fontFamily: theme.fontFamily,
  },
  listItemOrderedContent: {
    fontSize: 18,
    color: '#000000',
    fontFamily: theme.fontFamily,
  },
  list: {
    fontSize: 18,
    color: '#000000',
    fontFamily: theme.fontFamily,
  },
  sublist: {
    fontSize: 18,
    color: '#000000',
    fontFamily: theme.fontFamily,
  },
  linkWrapper: {
    alignSelf: 'flex-start',
    fontFamily: theme.fontFamily,
  },
  link: {
    alignSelf: 'flex-start',
    textDecorationLine: 'underline',
    fontFamily: theme.fontFamily,
  },
  image: {
    resizeMode: 'contain',
  },
};

export default styles;
