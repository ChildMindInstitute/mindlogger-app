import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';

import { TouchBox, BodyText } from './core';

import theme from '../themes/variables';

const styles = StyleSheet.create({
  box: {
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 7,
    marginBottom: 7,
  },
  inner: {
    alignItems: 'center',
  },
  textBlock: {
    flex: 1,
  },
  text: {
    fontFamily: theme.fontFamily,
  },
  selected: {
    borderColor: '#0067A0',
  },
});

const ListButton = ({ title, onPress, selected }) => {
  return (
    <TouchBox style={[styles.box, selected && styles.selected]} onPress={onPress}>
      <View style={styles.inner}>
        <View style={styles.textBlock}>
          <BodyText style={styles.text}>{title}</BodyText>
        </View>
      </View>
    </TouchBox>
  );
};

ListButton.defaultProps = {
  selected: false,
};

ListButton.propTypes = {
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  selected: PropTypes.bool,
};

export default ListButton;
