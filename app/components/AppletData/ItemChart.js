import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import moment from 'moment';
import i18n from 'i18next';

import TokenChart from './TokenChart';
import BaseText from '../base_text/base_text';

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

    const values = item.question['en'].split("\n");

    return (
      <View style={styles.plotView}>
        <BaseText
          style={{
            fontWeight: 'bold',
            paddingBottom: 20,
            paddingTop: 20,
            paddingHorizontal: 20,
          }}
          value={values[values.length - 1]}
        />
        {item.additionalParams.timelineChart}
      </View>
    );
  }

  renderTokenPlot() {
    const values = {};
    const { item, data, tokens } = this.props;
    const { enableNegativeTokens } = item.valueConstraints;

    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - currentDate.getDay());
    const dayOfWeeks = i18n.t('calendar:weekdays').split('_');
    const itemValues = item.valueConstraints.itemList.map(itemData => {
      return {
        name: itemData.name.en,
        value: itemData.value,
      }
    });

    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    const year = currentDate.getFullYear();
    const newDate = `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;

    if (item.additionalParams.activeCount === 0) {
      return null;
    }

    data.forEach((val) => {
      if (val.date >= newDate) {
        const currentDay = dayOfWeeks[moment(val.date).day()];
        const sum = Array.isArray(val.value)
          ? val.value.reduce((a, b) => {
            const bValue = !isNaN(b) ? parseInt(b) : itemValues.find(({ name }) => name === b).value;
            if (enableNegativeTokens || bValue > 0) {
              return a + bValue;
            }
            return a;
          }, 0)
          : val.value;
        values[currentDay] = values[currentDay] === undefined ? sum : values[currentDay] + sum;
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
      currentBalance: Number.isInteger(tokens.cumulativeToken) ? (tokens.cumulativeToken) : 0,
    };

    const questions = item.question['en'].split("\n");

    return (
      <View style={styles.plotView}>
        <BaseText
          style={{
            fontWeight: 'bold',
            paddingBottom: 20,
            paddingTop: 20,
            paddingHorizontal: 20,
          }}
          value={questions[questions.length - 1]}
        />
        {/* {item.additionalParams.timelineChart} */}
        <TokenChart item={item} data={dataValues} labels={item.additionalParams.labels} tokens={tokenHistory}/>
      </View>
    );
  }

  // eslint-disable-next-line
  renderLinePlot() {
    const { item /* , data */ } = this.props;

    if (item.additionalParams.activeCount === 0) {
      return null;
    }

    const values = item.question['en'].split("\n");

    return (
      <View style={styles.plotView}>
        <BaseText style={styles.linePlotTitle} value={values[values.length - 1]} />
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

    const values = item.question['en'].split("\n");
    
    return (
      <View style={styles.plotView}>
        <BaseText
          style={{
            fontWeight: 'bold',
            paddingBottom: 20,
            paddingTop: 20,
            paddingHorizontal: 20,
          }}
          value={values[values.length - 1]}
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
