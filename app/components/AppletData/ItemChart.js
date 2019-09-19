import React from 'react';
import PropTypes from 'prop-types';
import { Text, View } from 'react-native';
import moment from 'moment';

// import { VictoryBar, VictoryChart, VictoryLabel } from 'victory-native';
// import { colors } from '../../themes/colors';
import TimelineChart from './TimelineChart';
import LineChart from './LineChart';
import BarChart from './BarChart';

// eslint-disable-next-line
class ItemChart extends React.Component {

  // eslint-disable-next-line
  renderTimelinePlot() {
    const { item, data } = this.props;
    const labels = item.valueConstraints.itemList.map(i => ({ name: i.name.en, value: i.value }));

    return (
      <TimelineChart data={data} labels={labels} />
    );
  }

  // eslint-disable-next-line
  renderLinePlot() {
    const { item, data } = this.props;
    const labels = item.valueConstraints.itemList.map(i => ({ name: i.name.en, value: i.value }));
    const minMaxLabels = [item.valueConstraints.minValue, item.valueConstraints.maxValue];

    return (
      <LineChart data={data} labels={labels} minMaxLabels={minMaxLabels} />
    );
  }

  // eslint-disable-next-line
  calcTimeDiff(data) {
    // data = {from: {hour: h, minute:mm}, to: {hour:h, minute: mm}}
    console.log('data is', data);
    const output = data.map((d) => {
      const dp = {};
      dp.date = d.date;
      const from = moment(`${d.value.from.hour}:${d.value.from.minute}`, 'h:mm');
      const to = moment(`${d.value.to.hour}:${d.value.to.minute}`, 'h:mm');
      dp.value = Math.abs(to.diff(from, 'hours'));
      return dp;
    });

    return output;
  }

  // eslint-disable-next-line
  renderBarPlot() {
    const { item, data } = this.props;

    if (item.inputType === 'timeRange') {
      const dataFix = this.calcTimeDiff(data);
      return (
        <BarChart data={dataFix} />
      );
    }
    const data1 = [
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
      <BarChart data={data1} />
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
  data: PropTypes.array.isRequired,
};

export default ItemChart;
