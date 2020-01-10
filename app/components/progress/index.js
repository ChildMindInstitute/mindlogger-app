import React from 'react';
import { View, StyleSheet } from 'react-native';
import * as Progress from 'react-native-progress';
import PropTypes from 'prop-types';
import { colors } from '../../themes/colors';

const styles = StyleSheet.create({
  progressValue: {
    textAlign: 'center',
    marginRight: 20,
    fontSize: 12,
  },
  progress: {
    alignItems: 'center',
    flexDirection: 'row',
    color: colors.blue,
  },
});

const ActProgress = ({ index, length }) => (
  <View padder style={styles.progress}>
    <Progress.Bar
      color={styles.progress.color}
      borderColor="white"
      style={{ flexGrow: 1 }}
      progress={(index + 1) / length}
      width={null}
      height={3}
      borderRadius={0}
      borderWidth={0}
    />
  </View>
);

ActProgress.defaultProps = {
  index: 0,
  length: 1,
};

ActProgress.propTypes = {
  index: PropTypes.number,
  length: PropTypes.number,
};

export default ActProgress;
