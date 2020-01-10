import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Text } from 'react-native';
import { TouchBox, SubHeading } from './core';
import theme from '../themes/variables';

const styles = StyleSheet.create({
  box: {
    position: 'relative',
    fontFamily: theme.fontFamily,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
});

export const ALL_APPLETS_ID = 'allAppletsId';

const AllAppletsIcon = ({ size = 64 }) => {
  return (
    <View
      style={{
        width: size,
        height: size,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'rgb(100, 200, 150)',
      }}
    >

      <Text
        style={{
          transform: [{ rotate: '180deg' }],
          fontFamily: theme.fontFamily,
          fontSize: size / 1.5,
          // color: 'rgba(255, 255, 255, 0.8)',
          // fontWeight: 'bold',
        }}
      >A
      </Text>
    </View>
  );
};

AllAppletsIcon.propTypes = {
  // eslint-disable-next-line react/require-default-props
  size: PropTypes.number,
};

const AllApplets = ({ onPress }) => {
  return (
    <View style={styles.box}>
      <TouchBox onPress={() => onPress({ id: ALL_APPLETS_ID })}>
        <View style={styles.inner}>
          <AllAppletsIcon />
          <View style={styles.textBlock}>
            <SubHeading style={{
              fontFamily: theme.fontFamily,
              marginBottom: 0,
              marginTop: 23,
            }}
            >All my activities
            </SubHeading>
          </View>
        </View>
      </TouchBox>
    </View>
  );
};

AllApplets.propTypes = {
  onPress: PropTypes.func.isRequired,
};

export default AllApplets;
