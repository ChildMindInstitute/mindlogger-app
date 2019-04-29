import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import ScreenButton from './screen/ScreenButton';

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
});

const ActivityButtons = ({
  nextLabel,
  prevLabel,
  actionLabel,
  onPressPrev,
  onPressNext,
  onPressAction,
}) => (
  <View style={styles.footer}>
    {prevLabel
      ? <ScreenButton transparent onPress={onPressPrev} text={prevLabel} />
      : <ScreenButton transparent />}
    {actionLabel
      ? <ScreenButton transparent onPress={onPressAction} text={actionLabel} />
      : <ScreenButton transparent />}
    {nextLabel !== 'Skip'
      ? <ScreenButton onPress={onPressNext} text={nextLabel} />
      : <ScreenButton transparent onPress={onPressNext} text={nextLabel} />}
  </View>
);

ActivityButtons.defaultProps = {
  nextLabel: undefined,
  prevLabel: undefined,
  actionLabel: undefined,
  onPressPrev: undefined,
  onPressNext: undefined,
  onPressAction: undefined,
};

ActivityButtons.propTypes = {
  nextLabel: PropTypes.string,
  prevLabel: PropTypes.string,
  actionLabel: PropTypes.string,
  onPressPrev: PropTypes.func,
  onPressNext: PropTypes.func,
  onPressAction: PropTypes.func,
};

export default ActivityButtons;
