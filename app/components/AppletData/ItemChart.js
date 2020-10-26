import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import moment from 'moment';

import TokenChart from './TokenChart';
import BaseText from '../base_text/base_text';
// import { VictoryBar, VictoryChart, VictoryLabel } from 'victory-native';
// import { colors } from '../../themes/colors';
// import LineChart from './LineChart';
// import BarChart from './BarChart';

const styles = {
  plotView: {
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
  },
  linePlotTitle: {
    fontWeight: 'bold',
    paddingTop: 20,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  linePlotLabel: {
    alignSelf: 'flex-start',
    paddingLeft: 14,
  },
};

class ItemChart extends React.Component {
  // eslint-disable-next-line
  renderTimelinePlot() {
    const { item /* , data */ } = this.props;

    if (item.additionalParams.activeCount === 0) {
      return null;
    }
    return (
      <View style={styles.plotView}>
        <BaseText
          style={{
            fontWeight: 'bold',
            paddingBottom: 20,
            paddingTop: 20,
            paddingHorizontal: 20,
          }}
          value={item.additionalParams.description}
        />
        {item.additionalParams.timelineChart}
        {/* <TimelineChart data={data} labels={item.additionalParams.labels} /> */}
      </View>
    );
  }

  renderTokenPlot() {
    const values = {};
    const { item, data } = this.props;

    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - currentDate.getDay());
    const dayOfWeeks = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const month = currentDate.getUTCMonth() + 1;
    const day = currentDate.getUTCDate();
    const year = currentDate.getUTCFullYear();
    const newDate = `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;

    if (item.additionalParams.activeCount === 0) {
      return null;
    }

    data.forEach((val) => {
      const sum = val.value.reduce((a, b) => {
        return a + b;
      }, 0);
      if (val.date >= newDate) {
        const currentDay = dayOfWeeks[moment(val.date).day()];
        values[currentDay] = values[currentDay] === undefined ? sum : values[currentDay] + sum;
      }
    });

    const dataValues = dayOfWeeks.map((dayOfWeek) => {
      if (Object.keys(values).includes(dayOfWeek)) {
        return {
          name: dayOfWeek,
          value: values[dayOfWeek],
        };
      }
      return {
        name: dayOfWeek,
        value: 0,
      };
    });

    return (
      <View style={styles.plotView}>
        <BaseText
          style={{
            fontWeight: 'bold',
            paddingBottom: 20,
            paddingTop: 20,
            paddingHorizontal: 20,
          }}
          value={item.additionalParams.description}
        />
        {/* {item.additionalParams.timelineChart} */}
        <TokenChart item={item} data={dataValues} labels={item.additionalParams.labels} />
      </View>
    );
  }

  // eslint-disable-next-line
  renderLinePlot() {
    const { item /* , data */ } = this.props;

    if (item.additionalParams.activeCount === 0) {
      return null;
    }
    return (
      <View style={styles.plotView}>
        <BaseText style={styles.linePlotTitle} value={item.additionalParams.description} />
        <BaseText style={styles.linePlotLabel} value={item.additionalParams.minMaxLabels[1]} />
        {item.additionalParams.lineChart}
        {/* <LineChart data={data} labels={item.additionalParams.labels} /> */}
        <BaseText style={styles.linePlotLabel} value={item.additionalParams.minMaxLabels[0]} />
      </View>
    );
  }

  renderBarPlot() {
    const { item } = this.props;

    if (item.additionalParams.activeCount === 0) {
      return null;
    }
    return (
      <View style={styles.plotView}>
        <BaseText
          style={{
            fontWeight: 'bold',
            paddingBottom: 20,
            paddingTop: 20,
            paddingHorizontal: 20,
          }}
          value={item.additionalParams.description}
        />
        {/* <BarChart data={item.additionalParams.dataFix} /> */}
      </View>
    );
  }

  render() {
    const { item, type } = this.props;
    // console.log('inputype', item.inputType, type);
    switch (item.inputType) {
      case 'radio':
        if (type === 'TokenLogger') {
          return this.renderTokenPlot();
        }
        return this.renderTimelinePlot();
      case 'slider':
        return this.renderLinePlot();
      case 'timeRange':
        return this.renderBarPlot();
      default:
        return null;
    }
  }
}

ItemChart.propTypes = {
  item: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
};

export default ItemChart;
