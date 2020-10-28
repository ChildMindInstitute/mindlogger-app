// @flow

/* REACT */
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  languageContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageButtonsContainer: {
    marginTop: 10,
    paddingHorizontal: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  languageBtn: {
    width: 150,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 5,
  },
});
