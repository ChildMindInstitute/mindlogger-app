import React from 'react';
import PropTypes from 'prop-types';
import { Text, View } from 'react-native';

// import { VictoryBar, VictoryChart, VictoryLabel } from 'victory-native';
// import { colors } from '../../themes/colors';
import TimelineChart from './TimelineChart';
import LineChart from './LineChart';
import BarChart from './BarChart';

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
    const { item, data } = this.props;

    if (item.additionalParams.activeCount === 0) {
      return null;
    }
    return (
      <View style={styles.plotView}>
        <Text style={{ fontWeight: 'bold', paddingBottom: 20, paddingTop: 20, paddingHorizontal: 20 }}>
          {item.additionalParams.description}
        </Text>
        <TimelineChart data={data} labels={item.additionalParams.labels} />
      </View>
    );
  }

  // eslint-disable-next-line
  renderLinePlot() {
    const { item, data } = this.props;

    if (item.additionalParams.activeCount === 0) {
      return null;
    }
    return (
      <View style={styles.plotView}>
        <Text style={styles.linePlotTitle}>
          {item.additionalParams.description}
        </Text>
        <Text style={styles.linePlotLabel}>
          {item.additionalParams.minMaxLabels[1]}
        </Text>
        <LineChart data={data} labels={item.additionalParams.labels} />
        <Text style={styles.linePlotLabel}>
          {item.additionalParams.minMaxLabels[0]}
        </Text>
      </View>
    );
  }

  // eslint-disable-next-line
  renderBarPlot() {
    const { item } = this.props;

    if (item.additionalParams.activeCount === 0) {
      return null;
    }
    return (
      <View style={styles.plotView}>
        <Text style={{ fontWeight: 'bold', paddingBottom: 20, paddingTop: 20, paddingHorizontal: 20 }}>
          {item.additionalParams.description}
        </Text>
        <BarChart data={item.additionalParams.dataFix} />
      </View>
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
        return null;
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
