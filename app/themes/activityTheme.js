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

export const markdownHtmlStyle = `
  * {
    font-family: ${theme.fontFamily};
    font-size: 22px;
    font-weight: 300;
    text-align: center;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: bold;
    margin-bottom: 18px;
    text-align: left;
  }

  h1 {
    font-size: 36px;
  }

  h2 {
    font-size: 30px;
  }

  h3 {
    font-size: 24px;
  }

  h4 {
    font-size: 20px;
  }

  h5 {
    font-size: 18px;
  }

  h6 {
    font-size: 16px;
  }

  p {
    text-align: center;
    font-size: 22px;
    font-weight: 300;
  }

  a {
    text-decoration: underline;
  }

  img {
    object-fit: contain;
    width: calc(100vw - 80px);
    margin: 0px 40px;
  }

  table {
    width: 100%;
    border: 1px solid;
    border-collapse: collapse;
  }

  tr {
    border-bottom: 1px solid black;
  }

  td {
    font-size: 14px;
    text-align: left;
  }
`

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
  heading4: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 18,
    fontFamily: theme.fontFamily,
  },
  heading5: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 18,
    fontFamily: theme.fontFamily,
  },
  heading6: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 18,
    fontFamily: theme.fontFamily,
  },
  paragraph: {
    alignSelf: 'center',
    fontSize: 22,
    fontWeight: '300',
    fontFamily: theme.fontFamily,
  },
  listItemUnorderedContent: {
    fontSize: 20,
    fontFamily: theme.fontFamily,
  },
  listItemOrderedContent: {
    fontSize: 18,
    fontFamily: theme.fontFamily,
  },
  list: {
    fontSize: 22,
    fontFamily: theme.fontFamily,
  },
  sublist: {
    fontSize: 18,
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
  text: {
    fontSize: 22,
    fontWeight: '300',
    fontFamily: theme.fontFamily,
  },
  image: {
    resizeMode: 'contain',
  },
};

export default styles;
