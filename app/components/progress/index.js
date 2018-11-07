import React, { Component } from 'react'
import { Text, View } from 'react-native'
import * as Progress from 'react-native-progress';
import {StyleSheet} from 'react-native';
import PropTypes from 'prop-types';

const styles=StyleSheet.create({
  progressValue: {
    textAlign:'center',
    marginRight: 20,
    fontSize: 12,
  },
  progress: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 10,
  }
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
        <Text style={styles.progressValue}>{`${index+1}/${length}`}</Text>
        <Progress.Bar style={{flexGrow: 1}} progress={index/length} width={null} height={12}/>
      </View>
    )
  }
}

export default ActProgress