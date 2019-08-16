import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, StatusBar, Text, View } from 'react-native';

import { VictoryBar, VictoryChart, VictoryLabel } from 'victory-native';
import { colors } from '../../themes/colors';

const data = [
  { x: '?', y: 1 },
  { x: '??', y: 2 },
  { x: '???', y: 3 },
];

// eslint-disable-next-line
class ItemChart extends React.Component {

  render() {
    const { item } = this.props;
    return (
      <View style={{ alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontWeight: 'bold' }}>
          { item.question.en }
        </Text>
        <VictoryChart domainPadding={25}>
          <VictoryBar
            categories={{
              x: ['?', '??', '???'],
            }}
            barRatio={0.9}
            x="x"
            y="y"
            alignment="middle"
            style={{ data: { fill: colors.lightGrey } }}
            data={data}
            labelComponent={<VictoryLabel style={{ fill: colors.lightGrey }} />}
          />

        </VictoryChart>
      </View>
    );
  }
}

ItemChart.propTypes = {
  item: PropTypes.object.isRequired,
};

export default ItemChart;
