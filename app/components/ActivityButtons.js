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

const renderButton = (label, enabled, onPress) => {
  if (!enabled || !label) {
    return (<ScreenButton transparent />);
  }
  return (<ScreenButton transparent onPress={onPress} text={label} />);
};

const ActivityButtons = ({
  nextLabel,
  nextEnabled,
  prevLabel,
  prevEnabled,
  actionLabel,
  onPressPrev,
  onPressNext,
  onPressAction,
}) => (
  <View style={styles.footer}>
    {renderButton(prevLabel, prevEnabled, onPressPrev)}
    {renderButton(actionLabel, true, onPressAction)}
    {renderButton(nextLabel, nextEnabled, onPressNext)}
  </View>
);

ActivityButtons.defaultProps = {
  nextLabel: undefined,
  nextEnabled: true,
  prevLabel: undefined,
  prevEnabled: true,
  actionLabel: undefined,
  onPressPrev: undefined,
  onPressNext: undefined,
  onPressAction: undefined,
};

ActivityButtons.propTypes = {
  nextLabel: PropTypes.string,
  nextEnabled: PropTypes.bool,
  prevLabel: PropTypes.string,
  prevEnabled: PropTypes.bool,
  actionLabel: PropTypes.string,
  onPressPrev: PropTypes.func,
  onPressNext: PropTypes.func,
  onPressAction: PropTypes.func,
};

export default ActivityButtons;
