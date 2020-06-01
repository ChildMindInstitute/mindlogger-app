import moment from 'moment';
import { min, max } from 'd3-array';
import { scaleTime, scaleLinear } from 'd3-scale';
import { Dimensions } from 'react-native';
import { Svg, Text, Line, Circle, Path } from 'react-native-svg';
import React from 'react';
import { line } from 'd3-shape';
import { colors } from '../../themes/colors';

const { width } = Dimensions.get('window');
const chartItemWidth = Math.round(width * 0.9);
const chartItemHeight = Math.round(width * (2 / 3)) + 20;
const barChartItemHeight = Math.round(width * (2 / 3));

const generateTimelineChart = (data, labels) => {
  const renderSingle = (label, data, xTicks, xMapper) => {
    const xDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    return (
      <Svg width={chartItemWidth} height={65} key={label.name}>
        <Text x="0" y="10">{label.name}</Text>
        <Line x1="0" y1="25" x2={chartItemWidth} y2="25" stroke={colors.lightGrey} strokeWidth="2" />
        {
          xTicks.map(x => <Circle x={x} y="25" r="5" fill={colors.lightGrey} key={`xtick__${x}__${Math.random()}`} />)
        }
        {
          xTicks.map((x, i) => (
            <Text x={x - 4} y={45} fill={colors.grey} key={`${x}__${i}__DAY`}>
              {xDays[i]}
            </Text>
          ))
        }
        {
          // only plot data where it matches label's value.
          data.filter((x) => {
            // if x is a list, check if its value has the label.value in it.
            if (Array.isArray(x.value)) {
              return x.value.indexOf(label.value) >= 0;
            }
            // if x is not a list.
            return x.value === label.value;
          }).map(x => <Circle x={xMapper(moment(x.date).toDate())} y="25" r="5" fill={colors.primary} key={`xtick__${x}__${Math.random()}`} />)
        }
      </Svg>
    );
  };

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
  const xMapper = scaleTime().domain([minDate, maxDate]).range([5, chartItemWidth - 5]).nice();

  // 4. calculate steps by day, between min and max date

  const dateTicks = [];
  for (let i = 0; i < diffDays + 1; i += 1) {
    dateTicks.push(moment(minDate).add(i, 'days').toDate());
  }

  // 5. put through mapper
  const xTicks = dateTicks.map(xMapper);

  return labels.map(label => renderSingle(label, data, xTicks, xMapper));
};

const generateLineChart = (data, labels) => {
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
    .range([leftMargin, chartItemWidth - rightMargin]).nice();

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
    .range([chartItemHeight - bottomMargin, bottomMargin])
    .domain([labelMin, labelMax]);

  // 8. calculate y-ticks. 1 for each label.

  const yTicks = labels.map(label => yMapper(label.value));

  // 9. calculate a line from x and y.

  const lineCreator = line()
    .x(d => xMapper(moment(d.date)))
    .y(d => yMapper(d.value));

  return (
    <Svg width={chartItemWidth} height={chartItemHeight}>
      <Line x1={leftMargin} y1={chartItemHeight - bottomMargin} x2={chartItemWidth} y2={chartItemHeight - bottomMargin} stroke={colors.lightGrey} strokeWidth="2" />
      {
        xTicks.map((x, i) => <Circle x={x} y={chartItemHeight - bottomMargin} r="5" fill={colors.lightGrey} key={`xTick__${i}__${x}`} />)
      }
      {
        xTicks.map((x, i) => (
          <Text x={x - 4} y={chartItemHeight - bottomMargin + 20} fill={colors.grey} key={`${x}__${i}__DAY`}>
            {xDays[i]}
          </Text>
        ))
      }
      <Line x1={leftMargin} y1={0} x2={leftMargin} y2={chartItemHeight - bottomMargin} stroke={colors.lightGrey} strokeWidth="2" />
      {
        yTicks.map((y, i) => <Circle x={leftMargin} y={y} r="5" fill={colors.lightGrey} key={`yTick__${i}__${y}`} />)
      }
      {
        data.map((d, i) => <Circle x={xMapper(moment(d.date).toDate())} y={yMapper(d.value)} r="5" fill={colors.primary} key={`xTick__${i}__${d.date}__${d.value}`} />)
      }
      <Path d={lineCreator(data)} fill="none" stroke={colors.primary} strokeWidth="2" />
    </Svg>
  );
};

const generateBarChart = (data) => {
  const leftMargin = 10;
  const rightMargin = 10;
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
    .range([leftMargin, chartItemWidth - rightMargin]).nice();

  // 4. calculate steps by day, between min and max date

  const dateTicks = [];
  for (let i = 0; i < diffDays + 1; i += 1) {
    dateTicks.push(moment(minDate).add(i, 'days').toDate());
  }

  // 5. put through mapper
  const xTicks = dateTicks.map(xMapper);
  const xDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // 6. calculate max data value.
  // bar plots should have 0 as the min.
  const dataMax = max(data, l => l.value);

  // 7. create y-mapper
  const yMapper = scaleLinear()
    .range([barChartItemHeight - bottomMargin, bottomMargin])
    .domain([0, dataMax]);

  return (
    <Svg width={chartItemWidth} height={barChartItemHeight}>
      <Line x1={leftMargin} y1={barChartItemHeight - bottomMargin} x2={chartItemWidth} y2={barChartItemHeight - bottomMargin} stroke={colors.lightGrey} strokeWidth="2" />
      {
        xTicks.map((x, i) => <Circle x={x} y={barChartItemHeight - bottomMargin} r="5" fill={colors.lightGrey} key={`${x}__${i}`} />)
      }
      {
        xTicks.map((x, i) => (
          <Text x={x - 4} y={barChartItemHeight - bottomMargin + 20} fill={colors.grey} key={`${x}__${i}__DAY`}>
            {xDays[i]}
          </Text>
        ))
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
};

const SvgGenerator = {
  generateTimelineChart,
  generateLineChart,
  generateBarChart,
};
export default SvgGenerator;
