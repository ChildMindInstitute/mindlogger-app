import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, StatusBar, Text, View } from 'react-native';

import { VictoryBar, VictoryChart, VictoryLabel } from 'victory-native';
import { colors } from '../../themes/colors';
import TimelineChart from './TimelineChart';
import LineChart from './LineChart';
import BarChart from './BarChart';

const data = [
  { x: '?', y: 1 },
  { x: '??', y: 2 },
  { x: '???', y: 3 },
];

// eslint-disable-next-line
class ItemChart extends React.Component {

  // eslint-disable-next-line
  renderTimelinePlot() {
    const { item } = this.props;

    const labels = item.valueConstraints.itemList.map(i => ({ name: i.name.en, value: i.value }));
    const data = [
      {
        value: 0,
        date: '2019-09-06',
      },
      {
        value: 0,
        date: '2019-09-05',
      },
      {
        value: 1,
        date: '2019-09-04',
      },
      {
        value: 1,
        date: '2019-09-03',
      },
      {
        value: 0,
        date: '2019-09-01',
      },
    ];
    return (
      <TimelineChart data={data} labels={labels} />
    );
  }

  // eslint-disable-next-line
  renderLinePlot() {
    const { item } = this.props;
    const data = [
      {
        value: 1,
        date: '2019-09-06',
      },
      {
        value: 2,
        date: '2019-09-05',
      },
      {
        value: 1,
        date: '2019-09-04',
      },
      {
        value: 4,
        date: '2019-09-03',
      },
      {
        value: 5,
        date: '2019-09-01',
      },
    ];
    const labels = item.valueConstraints.itemList.map(i => ({ name: i.name.en, value: i.value }));
    const minMaxLabels = [item.valueConstraints.minValue, item.valueConstraints.maxValue];

    return (
      <LineChart data={data} labels={labels} minMaxLabels={minMaxLabels} />
    );
  }

  // eslint-disable-next-line
  renderBarPlot() {
    const { item } = this.props;
    const data = [
      {
        value: 7,
        date: '2019-09-06',
      },
      {
        value: 4,
        date: '2019-09-05',
      },
      {
        value: 9,
        date: '2019-09-04',
      },
      {
        value: 8,
        date: '2019-09-03',
      },
      {
        value: 6,
        date: '2019-09-01',
      },
    ];

    return (
      <BarChart data={data} />
    );
  }

  // eslint-disable-next-line
  renderChartByItemType() {
    const { item } = this.props;
    switch (item.inputType) {
      case 'radio':
        return this.renderTimelinePlot();
      case 'slider':
        return this.renderLinePlot();
      case 'timeRange':
        return this.renderBarPlot();
      default:
        return (
          <Text>
            No chart type specified for {item.inputType}.
          </Text>
        );
    }
  }

  render() {
    const { item } = this.props;
    // console.log('item is', item);
    return (
      <View style={{ alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontWeight: 'bold', paddingBottom: 20, paddingTop: 20 }}>
          { item.description ? item.description.en : '' }
        </Text>
        {this.renderChartByItemType()}
      </View>
    );
  }
}

ItemChart.propTypes = {
  item: PropTypes.object.isRequired,
};

export default ItemChart;
