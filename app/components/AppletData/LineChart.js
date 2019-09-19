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


const textBreaker = (text, charLength) => {
  const textBreakBySpace = text.split(' ');
  let current = 0;
  const output = [textBreakBySpace[0]];

  // eslint-disable-next-line
  for (let i=1; i<textBreakBySpace.length; i += 1) {
    const tt = textBreakBySpace[i];
    const line = output[current];
    if (line.length < charLength) {
      output[current] += ` ${tt}`;
    } else {
      output.push(tt);
      current += 1;
    }
  }

  return output;
};

// eslint-disable-next-line
class LineChart extends React.Component {
  // eslint-disable-next-line
  render() {
    const { data, labels, minMaxLabels } = this.props;
    const width = Math.round(Dimensions.get('window').width * 0.9);
    const height = Math.round(width * (2 / 3));

    const leftMargin = 70;
    const rightMargin = 5;
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
    const maxDateMoment = moment(maxDate);

    // 2. min date should at least be 7 days before max date
    let diffDays = moment(maxDateMoment).diff(minDateMoment, 'days');
    diffDays = max([diffDays, 6]);
    minDate = maxDateMoment.subtract(diffDays, 'days').toDate();

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

    const minLabelBreak = textBreaker(minMaxLabels[0], 9);
    const maxLabelBreak = textBreaker(minMaxLabels[1], 9);
    return (
      <Svg width={width} height={height}>
        <Line x1={leftMargin} y1={height - bottomMargin} x2={width} y2={height - bottomMargin} stroke={colors.lightGrey} strokeWidth="2" />
        {
          xTicks.map((x, i) => <Circle x={x} y={height - bottomMargin} r="3" fill={colors.lightGrey} key={`xTick__${i}__${x}`} />)
        }
        <Line x1={leftMargin} y1={0} x2={leftMargin} y2={height - bottomMargin} stroke={colors.lightGrey} strokeWidth="2" />
        {
          yTicks.map((y, i) => <Circle x={leftMargin} y={y} r="3" fill={colors.lightGrey} key={`yTick__${i}__${y}`} />)
        }
        {
          data.map((d, i) => <Circle x={xMapper(moment(d.date).toDate())} y={yMapper(d.value)} r="5" fill={colors.primary} key={`xTick__${i}__${d.date}__${d.value}`} />)
        }
        <Path d={lineCreator(data)} fill="none" stroke={colors.primary} strokeWidth="2" />

        <Text x={0} y={height - bottomMargin - 20} textAnchor="start">
          {minLabelBreak.map((t, i) => <TSpan x={0} dy={10} key={`minLabel_${t}__${i}`}>{t}</TSpan>)}
        </Text>
        <Text x={0} y={10} textAnchor="start">
          {maxLabelBreak.map((t, i) => <TSpan x={0} dy={10} key={`maxLabel_${t}__${i}`}>{t}</TSpan>)}
        </Text>
      </Svg>
    );
  }
}

LineChart.propTypes = {
  data: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
  minMaxLabels: PropTypes.array.isRequired,
};

export default LineChart;
