import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

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
    const { item } = this.props;
    switch (item.inputType) {
      case 'radio':
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
  data: PropTypes.array.isRequired,
};

export default ItemChart;
