import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import moment from 'moment';
import i18n from 'i18next';

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
    const accValues = {}
    const { item, data, tokens } = this.props;

    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - currentDate.getDay());
    const dayOfWeeks = i18n.t('calendar:weekdays').split('_');

    const month = currentDate.getUTCMonth() + 1;
    const day = currentDate.getUTCDate();
    const year = currentDate.getUTCFullYear();
    const newDate = `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;

    if (item.additionalParams.activeCount === 0) {
      return null;
    }

    data.forEach((val) => {
      const sum = Array.isArray(val.value)
        ? val.value.reduce((a, b) => {
          if (!b) return a;
          return a + parseInt(b);
        }, 0)
        : val.value;
      const accSum = Array.isArray(val.value)
        ? val.value.reduce((a, b) => {
          if (!b) return a > 0 ? a : 0;
          let c = a > 0 ? a : 0
          let d = parseInt(b) > 0 ? parseInt(b) : 0
          return c + d;
        }, 0)
        : (val.value > 0 ? val.value : 0);
      if (val.date >= newDate) {
        const currentDay = dayOfWeeks[moment(val.date).day()];
        values[currentDay] = values[currentDay] === undefined ? sum : values[currentDay] + sum;
        accValues[currentDay] = accValues[currentDay] === undefined ? accSum : accValues[currentDay] + accSum;
      }
    });

    const dataValues = dayOfWeeks.map((dayOfWeek) => {
      if (Object.keys(values).includes(dayOfWeek)) {
        return {
          name: dayOfWeek,
          value: parseInt(values[dayOfWeek]),
        };
      }
      return {
        name: dayOfWeek,
        value: 0,
      };
    });

    const dataAccValues = dayOfWeeks.map((dayOfWeek) => {
      if (Object.keys(accValues).includes(dayOfWeek)) {
        return {
          name: dayOfWeek,
          value: parseInt(accValues[dayOfWeek]),
        };
      }
      return {
        name: dayOfWeek,
        value: 0,
      };
    });

    const tokenUpdates = tokens.tokenUpdates.filter(tokenUpdate => tokenUpdate.created >= newDate).reduce((usedTokens, tokenUpdate) => {
      const day = dayOfWeeks[moment(tokenUpdate.created).day()];

      usedTokens[day] = usedTokens[day] || 0;
      usedTokens[day] += tokenUpdate.value;

      return usedTokens;
    }, {})

    const tokenHistory = {
      tokenUpdates: dayOfWeeks.map(day => ({
        name: day,
        value: (tokenUpdates[day] || 0)
      })),
      currentBalance: tokens.cumulativeToken,
    };

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
        <TokenChart item={item} data={dataValues} acc={dataAccValues} labels={item.additionalParams.labels} tokens={tokenHistory}/>
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
  tokens: PropTypes.object.isRequired,
};

export default ItemChart;
