import { StyleSheet } from 'react-native';

export default styles = StyleSheet.create({
  body: {
    flex: 1,
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
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '300'
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
    backgroundColor: '#ffdddd'
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
    backgroundColor: '#99ff9f'
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
  },
  redIcon: {
    color: '#d10000',
    fontSize: 60,
  },
  greenIcon: {
    color: '#00a30a',
    fontSize: 60,
  }
});

export const markdownStyle = {
  heading1: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 18,
  },
  heading2: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 18,
  },
  heading3: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 18,
  },
  paragraph: {
    alignSelf: 'flex-start',
    fontSize: 18,
    color: '#000000',
  },
  listItemUnorderedContent: {
    fontSize: 18,
  },
  listItemOrderedContent: {
    fontSize: 18,
  },
  linkWrapper: {
    alignSelf: 'flex-start',
  },
  link: {
    alignSelf: 'flex-start',
    textDecorationLine: 'underline',
  },
  image: {
    resizeMode: 'contain',
  },
};
