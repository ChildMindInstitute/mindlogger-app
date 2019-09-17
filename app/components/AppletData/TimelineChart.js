import React from 'react';
import PropTypes from 'prop-types';
import { Dimensions, FlatList } from 'react-native';
import moment from 'moment';
import {
  Svg,
  Line,
  Text,
  Circle,
} from 'react-native-svg';
import { min, max } from 'd3-array';
import { scaleTime } from 'd3-scale';

import { colors } from '../../themes/colors';

// eslint-disable-next-line
class TimelineChart extends React.Component {

  // eslint-disable-next-line
  renderSingle(label, data, xTicks, xMapper) {
    const width = Math.round(Dimensions.get('window').width * 0.9);
    return (
      <Svg width={width} height={50} key={label.name}>
        <Text x="0" y="10">{label.name}</Text>
        <Line x1="0" y1="25" x2={width} y2="25" stroke={colors.lightGrey} strokeWidth="2" />
        {
          xTicks.map(x => <Circle x={x} y="25" r="5" fill={colors.lightGrey} key={`xtick__${x}__${Math.random()}`} />)
        }
        {
          // only plot data where it matches label's value.
          data.filter(x => x.value === label.value).map(x => <Circle x={xMapper(moment(x.date).toDate())} y="25" r="5" fill={colors.primary} key={`xtick__${x}__${Math.random()}`} />)
        }
      </Svg>
    );
  }

  render() {
    const { data, labels } = this.props;
    const width = Math.round(Dimensions.get('window').width * 0.9);
    // 1. calculate minimum and maximum date
    const dateArray = data.map(d => moment(d.date).toDate());
    let minDate = min(dateArray);
    const minDateMoment = moment(minDate);
    const maxDate = max(dateArray);
    const maxDateMoment = moment(maxDate);

    // 2. min date should at least be 7 days before max date
    let diffDays = moment(maxDateMoment).diff(minDateMoment, 'days');
    diffDays = max([diffDays, 6]);
    minDate = maxDateMoment.subtract(diffDays, 'days').toDate();

    // 3. create linear mapping between width and min,max
    const xMapper = scaleTime().domain([minDate, maxDate]).range([5, width - 5]).nice();

    // 4. calculate steps by day, between min and max date

    const dateTicks = [];
    for (let i = 0; i < diffDays + 1; i += 1) {
      dateTicks.push(moment(minDate).add(i, 'days').toDate());
    }

    // 5. put through mapper
    const xTicks = dateTicks.map(xMapper);
    //   <FlatList
    //   data={applet.activities}
    //   renderItem={({ item }) => <ActivityChart activity={item} />}
    //   keyExtractor={(item, index) => `${applet.name.en}__${index}`}
    // />
    return (
      <FlatList
        data={labels}
        keyExtractor={(item, index) => {
          const key = `${item.name}__${index}__${Math.random()}`;
          return key;
        }}
        renderItem={({ item }) => this.renderSingle(item, data, xTicks, xMapper)}
      />
    );
    // labels.map(label => this.renderSingle(label, data, xTicks, xMapper));
  }
}

TimelineChart.propTypes = {
  data: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
};

export default TimelineChart;
