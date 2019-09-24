import React from 'react';
import PropTypes from 'prop-types';
import { Dimensions } from 'react-native';
import moment from 'moment';
import {
  Svg,
  Line,
  Text,
  TSpan,
  Circle,
  Path,
} from 'react-native-svg';
import { min, max } from 'd3-array';
import { scaleTime, scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';

import { colors } from '../../themes/colors';


// eslint-disable-next-line
class BarChart extends React.Component {
  // eslint-disable-next-line
  render() {
    const { data } = this.props;
    const width = Math.round(Dimensions.get('window').width * 0.9);
    const height = Math.round(width * (2 / 3));

    const leftMargin = 10;
    const rightMargin = 10;
    const bottomMargin = 5;

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
    minDate = maxDateMoment.subtract(diffDays, 'days').startOf('day').toDate();
    maxDate = moment().startOf('day').toDate();

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

    // 6. calculate max data value.
    // bar plots should have 0 as the min.
    const dataMax = max(data, l => l.value);

    // 7. create y-mapper
    const yMapper = scaleLinear()
      .range([height - bottomMargin, bottomMargin])
      .domain([0, dataMax]);


    return (
      <Svg width={width} height={height}>
        <Line x1={leftMargin} y1={height - bottomMargin} x2={width} y2={height - bottomMargin} stroke={colors.lightGrey} strokeWidth="2" />
        {
          xTicks.map((x, i) => <Circle x={x} y={height - bottomMargin} r="5" fill={colors.lightGrey} key={`${x}__${i}`} />)
        }

        {
          data.map((d, i) => (
            <Line
              x1={xMapper(moment(d.date).toDate())}
              x2={xMapper(moment(d.date).toDate())}
              y1={yMapper(0)}
              y2={yMapper(d.value)}
              strokeWidth="25"
              stroke={colors.primary}
              key={`line__${d.date}__${d.value}__${i}`}
            />
          ))
        }
        {
          data.map((d, i) => (
            <Text
              x={xMapper(moment(d.date).toDate()) - 5}
              y={yMapper(d.value) + 15}
              fill="white"
              textAnchor="start"
              key={`text__${d.date}__${d.value}__${i}`}
            >
              {d.value}
            </Text>
          ))
        }
      </Svg>
    );
  }
}

BarChart.propTypes = {
  data: PropTypes.array.isRequired,
};

export default BarChart;
