import React from 'react';
import PropTypes from 'prop-types';
import { Dimensions, StyleSheet, View } from 'react-native';
import moment from 'moment';
import {
  Svg,
  Line,
  Text,
  Circle,
  Path,
} from 'react-native-svg';
import { min, max } from 'd3-array';
import { scaleTime, scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';

import { colors } from '../../themes/colors';

const width = Math.round(Dimensions.get('window').width * 0.9);
const height = Math.round(width * (2 / 3)) + 20;

const styles = StyleSheet.create({
  lineChartContainer: {
    width,
    height: height + 40,
  },
  topLabel: {
    paddingBottom: 10,
  },
  bottomLabel: {
    alignSelf: 'flex-end',
    paddingTop: 10,
    paddingRight: 5
  },
});

// eslint-disable-next-line
class LineChart extends React.Component {
  // eslint-disable-next-line
  render() {
    const { data, labels, minMaxLabels } = this.props;

    const leftMargin = 5;
    const rightMargin = 5;
    const bottomMargin = 25;

    // 1. calculate minimum and maximum date
    const dateArray = data.map(d => moment(d.date).toDate());
    let minDate = min(dateArray);

    if (!minDate) {
      minDate = new Date();
    }

    const minDateMoment = moment(minDate);
    let maxDate = max(dateArray);

    if (!maxDate) {
      maxDate = new Date();
    }

    // WATCH OUT: the max date for now is today.
    const maxDateMoment = moment(); // moment(maxDate);

    // 2. min date should at least be 7 days before max date
    let diffDays = moment(maxDateMoment).diff(minDateMoment, 'days');

    // WATCH OUT: hard-code a week.
    diffDays = 6; // max([diffDays, 6]);
    minDate = maxDateMoment.subtract(new Date().getDay() - 1, 'days').startOf('day').toDate();
    maxDate = maxDateMoment.add(6, 'days').startOf('day').toDate();

    // 3. create linear mapping between width and min,max
    const xMapper = scaleTime()
      .domain([minDate, maxDate])
      .range([leftMargin, width - rightMargin]).nice();

    // 4. calculate steps by day, between min and max date

    const dateTicks = [];
    for (let i = 0; i < diffDays + 1; i += 1) {
      dateTicks.push(moment(minDate).add(i, 'days').toDate());
    }

    // 5. put through mapper
    const xTicks = dateTicks.map(xMapper);
    const xDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    // 6. calculate min and max label values.
    const labelMin = min(labels, l => l.value);
    const labelMax = max(labels, l => l.value);

    // 7. create y-mapper
    const yMapper = scaleLinear()
      .range([height - bottomMargin, bottomMargin])
      .domain([labelMin, labelMax]);

    // 8. calculate y-ticks. 1 for each label.

    const yTicks = labels.map(label => yMapper(label.value));

    // 9. calculate a line from x and y.

    const lineCreator = line()
      .x(d => xMapper(moment(d.date)))
      .y(d => yMapper(d.value));

    return (
      <View style={styles.lineChartContainer}>
        <Text style={styles.topLabel}>
          {minMaxLabels[1]}
        </Text>
        <Svg width={width} height={height}>
          <Line x1={leftMargin} y1={height - bottomMargin} x2={width} y2={height - bottomMargin} stroke={colors.lightGrey} strokeWidth="2" />
          {
            xTicks.map((x, i) => <Circle x={x} y={height - bottomMargin} r="5" fill={colors.lightGrey} key={`xTick__${i}__${x}`} />)
          }
          {
            xTicks.map((x, i) => (
              <Text x={x - 4} y={height - bottomMargin + 20} fill={colors.grey} key={`${x}__${i}__DAY`}>
                {xDays[i]}
              </Text>
            ))
          }
          <Line x1={leftMargin} y1={0} x2={leftMargin} y2={height - bottomMargin} stroke={colors.lightGrey} strokeWidth="2" />
          {
            yTicks.map((y, i) => <Circle x={leftMargin} y={y} r="5" fill={colors.lightGrey} key={`yTick__${i}__${y}`} />)
          }
          {
            data.map((d, i) => <Circle x={xMapper(moment(d.date).toDate())} y={yMapper(d.value)} r="5" fill={colors.primary} key={`xTick__${i}__${d.date}__${d.value}`} />)
          }
          <Path d={lineCreator(data)} fill="none" stroke={colors.primary} strokeWidth="2" />

        </Svg>
        <Text style={styles.bottomLabel}>
          {minMaxLabels[0]}
        </Text>
      </View>
    );
  }
}

LineChart.propTypes = {
  data: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
  minMaxLabels: PropTypes.array.isRequired,
};

export default LineChart;
