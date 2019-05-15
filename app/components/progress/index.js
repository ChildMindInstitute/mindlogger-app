import React, { Component } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import * as Progress from 'react-native-progress';
import PropTypes from 'prop-types';
import { colors } from '../../themes/colors';

const styles = StyleSheet.create({
  progressValue: {
    textAlign:'center',
    marginRight: 20,
    fontSize: 12,
  },
  progress: {
    alignItems: 'center',
    flexDirection: 'row',
    // padding: 10,
    color: colors.blue,
  },
});

export class ActProgress extends Component {

  static propTypes = {
    index: PropTypes.number,
    length: PropTypes.number,
  }

  render() {
    const {index, length} = this.props;
    return (
      <View padder style={styles.progress}>
        <Progress.Bar color={styles.progress.color} borderColor="white" style={{flexGrow: 1}} progress={(index + 1) / length} width={null} height={3} borderRadius={0} borderWidth={0}/>
      </View>
    )
  }
}

export default ActProgress