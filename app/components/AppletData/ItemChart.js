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
    let activeCount = 0;

    for (let i = 0; i < data.length; i += 1) {
      const differenceTime = (new Date().getTime() - moment(data[i].date).toDate().getTime())
      const differenceDay = differenceTime / (1000 * 3600 * 24);
      if (differenceDay < 7) {
        activeCount += 1;
      }
    }
    if (activeCount === 0) {
      return (
        <View />
      );
    }
    return (
      <View style={{ alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontWeight: 'bold', paddingBottom: 20, paddingTop: 20, paddingHorizontal: 20 }}>
          { item.description ? item.description.en : item.question.en }
        </Text>
        <TimelineChart data={data} labels={labels} />
      </View>
    );
  }

  // eslint-disable-next-line
  renderLinePlot() {
    const { item, data } = this.props;
    const labels = item.valueConstraints.itemList.map(i => ({ name: i.name.en, value: i.value }));
    const minMaxLabels = [item.valueConstraints.minValue, item.valueConstraints.maxValue];
    let activeCount = 0;

    for (let i = 0; i < data.length; i += 1) {
      const differenceTime = new Date().getTime() - moment(data[i].date).toDate().getTime();
      const differenceDay = differenceTime / (1000 * 3600 * 24);
      if (differenceDay < 7) {
        activeCount += 1;
      }
    }
    if (activeCount === 0) {
      return (
        <View />
      );
    }
    return (
      <View style={{ alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontWeight: 'bold', paddingBottom: 20, paddingTop: 20, paddingHorizontal: 20 }}>
          { item.description ? item.description.en : item.question.en }
        </Text>
        <LineChart data={data} labels={labels} minMaxLabels={minMaxLabels} />
      </View>
    );
  }

  // eslint-disable-next-line
  calcTimeDiff(data) {
    // data = {from: {hour: h, minute:mm}, to: {hour:h, minute: mm}}

    const output = data.map((d) => {
      const dp = {};
      dp.date = d.date;
      const from = moment(`${d.value.from.hour}:${d.value.from.minute}`, 'h:mm');

      // we need to assume that if from.hour is > 12, then it was the day before.
      // if not, it can stay as is for the current day.

      if (d.value.from.hour >= 12) {
        from.subtract(1, 'days');
      }

      const to = moment(`${d.value.to.hour}:${d.value.to.minute}`, 'h:mm');
      dp.value = Math.round(Math.abs(to.diff(from, 'hours')));
      return dp;
    });

    return output;
  }

  // eslint-disable-next-line
  renderBarPlot() {
    const { item, data } = this.props;
    let activeCount = 0;

    for (let i = 0; i < data.length; i += 1) {
      const differenceTime = (new Date().getTime() - moment(data[i].date).toDate().getTime())
      const differenceDay = differenceTime / (1000 * 3600 * 24);
      if (differenceDay < 7) {
        activeCount += 1;
      }
    }
    if (activeCount === 0) {
      return (
        <View />
      );
    }
    if (item.inputType === 'timeRange') {
      const dataFix = this.calcTimeDiff(data);
      return (
        <View style={{ alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontWeight: 'bold', paddingBottom: 20, paddingTop: 20, paddingHorizontal: 20 }}>
            { item.description ? item.description.en : item.question.en }
          </Text>
          <BarChart data={dataFix} />
        </View>
      );
    }
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
          <Text />
        );
    }
  }

  render() {
    return this.renderChartByItemType();
  }
}

ItemChart.propTypes = {
  item: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
};

export default ItemChart;
