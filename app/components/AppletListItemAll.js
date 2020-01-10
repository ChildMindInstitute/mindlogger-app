import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Text } from 'react-native';
import { TouchBox, LittleHeading } from './core';
import theme from '../themes/variables';
import { colors } from '../themes/colors';

const styles = StyleSheet.create({
  box: {
    position: 'relative',
    fontFamily: theme.fontFamily,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    fontFamily: theme.fontFamily,
  },
  textBlock: {
    flex: 1,
    marginLeft: 16,
    fontFamily: theme.fontFamily,
  },
  notification: {
    position: 'absolute',
    top: 0,
    right: 10,
  },
  all: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  allText: {
    marginBottom: 5,
    color: colors.black,
    fontSize: 40,
    transform: [
      {
        rotate: '180deg',
      },
    ],
  },
});

const AppletListItemAll = ({ onPress }) => {
  return (
    <View style={styles.box}>
      <TouchBox onPress={() => onPress('all')}>
        <View style={styles.inner}>
          <View style={styles.all}>
            <Text style={styles.allText}>A</Text>
          </View>
          <View style={styles.textBlock}>
            <LittleHeading
              style={{ fontFamily: theme.fontFamily, color: colors.black }}
            >
              all my activities
            </LittleHeading>
          </View>
        </View>
      </TouchBox>
    </View>
  );
};

AppletListItemAll.propTypes = {
  onPress: PropTypes.func.isRequired,
};

export default AppletListItemAll;
