import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Dimensions, View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Svg, Line, Path, Polygon, Circle } from 'react-native-svg';
import { getTokenResponses } from '../../../services/api';
import moment from 'moment';
import TokenHeader from './header';
import RangeSelector from './RangeSelector';
import BehaviorAggregation from './BehaviorAggregation';
import { authTokenSelector } from '../../../state/user/user.selectors';

const coin = require('../../../../img/coin.png');

const styles = StyleSheet.create({
  tooltip: {
    alignSelf: 'flex-end',
    backgroundColor: '#F2F9FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    marginTop: 10,
    marginBottom: 20
  }
});

// deprecated
// eslint-disable-next-line
class TokenChart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      range: '1w',
      downloading: false,
      ...this.formatResponses(props.data),
    };

    this.downloadedRange = '1w';

    this.constants = {
      pathColor: '#FCB92D',
      starColor: '#FCB92D',
      fillColor: '#FEEFB4',
      textColor: '#FCB92D',
      tick: {
        lineHeight: 6,
        labelHeight: 15
      },
      graphMargin: {
        horizontal: 25,
        vertical: 10,
      },
      strokeWidth: 4
    };

    this.availableIntervals = [
      { amount: 1, unit: 'days', range: 'Today' },
      { amount: 1, unit: 'weeks', range: '1w' },
      { amount: 2, unit: 'weeks', range: '2w' },
      { amount: 1, unit: 'months', range: '1m' },
      { amount: 3, unit: 'months', range: '3m' },
      { amount: 1, unit: 'year', range: '1y' },
      { range: 'All' }
    ];

    this.cumulative = props.data.cumulative || 0;
  }

  formatResponses (data) {
    const changes = [];

    for (const token of data.tokens) {
      for (const change of token.data) {
        changes.push({
          isTracker: false,
          spend: change.spend || false,
          time: change.time,
          value: change.value
        })
      }
    }

    for (const tracker of data.trackers) {
      changes.push({
        isTracker: true,
        spend: false,
        time: tracker.data.time,
        value: tracker.data.value
      })
    }

    changes.sort((a, b) => {
      if (a.time > b.time) return -1;
      if (a.time < b.time) return 1;
      return 0;
    })

    return { changes, trackerAggregation: data.trackerAggregation };
  }

  compareRanges (a, b) {
    const indexA = this.availableIntervals.findIndex(interval => interval.range == a);
    const indexB = this.availableIntervals.findIndex(interval => interval.range == b);

    if (indexA < indexB) return -1;
    if (indexA > indexB) return 1;

    return 0;
  }

  updateRange (range) {
    if (this.compareRanges(this.downloadedRange, range) < 0) {
      const endDate = new Date(moment(new Date()).format('YYYY/MM/DD'));
      endDate.setDate(endDate.getDate()+1);

      const startDate = this.startDate(endDate, range)

      this.setState({ downloading: true })

      getTokenResponses(this.props.authToken, this.props.applet, range == 'All' ? null : startDate).then(response => {
        this.setState({
          downloading: false,
          ...this.formatResponses(response),
        })

        this.downloadedRange = range;
      })
    }

    this.setState({ range })
  }

  yUnit (graphHeight) {
    const { changes } = this.state;

    let maxCumulative = this.cumulative, current = this.cumulative;

    for (const change of changes) {
      current -= change.value;

      if (maxCumulative < current) {
        maxCumulative = current;
      }
    }

    return Math.min(10, (graphHeight - this.constants.strokeWidth) / maxCumulative);
  }

  startDate (endDate, range) {
    const endTime = moment(endDate);

    let minimumDate = null;
    for (const change of this.state.changes) {
      if (minimumDate == null || minimumDate.getTime() > change.time) {
        minimumDate = new Date(change.time);
      }
    }
    if (!minimumDate) {
      minimumDate = new Date();
    }

    minimumDate.setDate(minimumDate.getDate() - 1);

    switch (range) {
      case 'Today':
        return endTime.subtract(1, 'days').toDate()
      case '1w':
        return endTime.subtract(1, 'weeks').toDate()
      case '2w':
        return endTime.subtract(2, 'weeks').toDate()
      case '1m':
        return endTime.subtract(1, 'months').toDate()
      case '3m':
        return endTime.subtract(3, 'months').toDate()
      case '1y':
        return endTime.subtract(1, 'years').toDate()
    }

    for (const interval of this.availableIntervals) {
      if (!interval.amount) {
        continue;
      }

      if (endTime.diff(minimumDate, interval.unit) < interval.amount) {
        return endTime.subtract(interval.amount, interval.unit).toDate()
      }
    }

    return new Date(`${endTime.format('YYYY-MM')}-01`);
  }

  getTicks (startDate, endDate, graphWidth) {
    const endTime = moment(endDate)
    let { range } = this.state;

    if (range == 'All') {
      range = '1y'

      for (const interval of this.availableIntervals) {
        if (endTime.diff(startDate, interval.unit) <= interval.amount ) {
          range = interval.range;
          break;
        }
      }
    }

    let unit = 'months', value = 1, ticks = [];

    if (range == 'Today') {
      const date = moment(startDate).format('YYYY-MM-DD')

      ticks = [
        {
          time: moment(startDate),
          text: moment(startDate).format('MMM DD'),
        },
        { time: moment(`${date} 12:00`, 'YYYY-MM-DD HH:mm'), text: 'Noon' },
        {
          time: moment(endDate),
          text: moment(endDate).format('MMM DD'),
        },
      ]
    } else {
      switch (range) {
        case '1w':
          unit = 'days';
          break;
        case '2w':
          unit = 'days';
          value = 2;
          break;
        case '1m':
          unit = 'weeks';
          break;
        case '3m':
          unit = 'weeks';
          value = 3;
          break;
        case '1y':
          unit = 'months';
          value = 2;
          break;
      }

      let tick = moment(startDate)

      if (range == '1y') {
        tick = moment(tick.format('YYYY-MM') + '01', 'YYYY-MM-DD')
      }

      const startTime = startDate.getTime();
      while (tick.unix() <= endTime.unix()) {
        if (tick.unix()*1000 >= startTime) {
          ticks.push({
            time: moment(tick)
          })
        }

        tick = tick.add(value, unit)
      }

      ticks = ticks.map((tick, index) => {
        let text = tick.time.format(!index || index == ticks.length-1 ? 'MMM DD' : 'MMM');
        if (unit == 'days' || unit == 'weeks') {
          text = tick.time.format(!index || index == ticks.length-1 ? 'MMM D' : 'D');
        }
        return { ...tick, text }
      })
    }

    return ticks.map(tick => ({
      ...tick,
      x: this.getX(tick.time.unix() * 1000, startDate, endDate, graphWidth)
    }))
  }

  getX (time, startDate, endDate, graphWidth) {
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    return graphWidth * (time - startTime) / (endTime - startTime);
  }

  cumulativePoints (startDate, endDate, graphWidth, graphHeight) {
    const startTime = startDate.getTime();
    const endTime = Math.min(endDate.getTime(), new Date().getTime());

    const changes = [
      { time: endTime, value: 0, spend: true },
      ...this.state.changes.filter(change => change.time >= startTime && change.time <= endTime),
      { time: startTime, value: 0, spend: true },
    ];

    const points = []
    let cumulative = this.cumulative, yUnit = this.yUnit(graphHeight);

    for (let i = 0; i < changes.length; i++) {
      if (changes[i].value) {
        points.push({
          x: this.getX(changes[i].time, startDate, endDate, graphWidth),
          y: graphHeight - yUnit * cumulative,
          spend: changes[i].spend,
          isTracker: changes[i].isTracker
        })
      }

      cumulative -= changes[i].value;

      points.push({
        x: this.getX(changes[i].time, startDate, endDate, graphWidth),
        y: graphHeight - yUnit * cumulative,
        spend: changes[i].spend,
        isTracker: changes[i].isTracker,
      })
    }

    return points;
  }

  cumulativePath (startDate, endDate, graphWidth, graphHeight) {
    const points = this.cumulativePoints(startDate, endDate, graphWidth, graphHeight);

    return points.map((point, index) => `${!index ? 'M' : 'L'} ${point.x} ${point.y - this.constants.strokeWidth/2}`).join(' ')
  }

  cumulativePolygon (startDate, endDate, graphWidth, graphHeight) {
    const points = this.cumulativePoints(startDate, endDate, graphWidth, graphHeight);

    const endTime = Math.min(endDate.getTime(), new Date().getTime());

    points.push({ x: this.getX(startDate.getTime(), startDate, endDate, graphWidth), y: graphHeight })
    points.push({ x: this.getX(endTime, startDate, endDate, graphWidth), y: graphHeight })

    return points.map(({ x, y }) => `${x}, ${y}`).join(' ')
  }

  getStarCoordinates (cx, cy, r) {
    const diff = 144 / 180 * Math.PI;
    const points = [];

    for (let i = 0; i < 5; i++) {
      const angle = Math.PI/2 - diff * i;
      points.push({ x: Math.cos(angle) * r + cx, y: Math.sin(angle) * r + cy })
    }

    return points.map(({x, y}) => `${x}, ${y}`).join(' ')
  }

  tokensForDateRange (start, range) {
    const { changes } = this.state;
    let tokens = 0;

    for (const change of changes) {
      if (change.time > start && change.time < start + range && !change.isTracker) {
        tokens += change.value;
      }
    }

    return tokens;
  }

  getPastTokensLabel(isTokenHeader = true) {
    const { range } = this.state;

    switch (range) {
      case 'Today':
        if (isTokenHeader) return 'yesterday';
        return 'today';
      case '1w':
        return 'past week';
      case '2w':
        return 'past 2 weeks';
      case '1m':
        return 'past month';
      case '3m':
        return 'past 3 months';
      case '1y':
        return 'past year';
    }
  }

  render () {
    const { applet } = this.props;
    const {
      tick: {
        labelHeight, lineHeight
      },
      graphMargin
    } = this.constants;
    const aggregation = {};

    const windowDimension = Dimensions.get('window');
    const SVGWidth = Math.round(windowDimension.width * 0.95) - graphMargin.horizontal * 2;
    const SVGHeight = Math.round(windowDimension.height * 0.25) - graphMargin.vertical * 2;

    const endDate = new Date(moment(new Date()).format('YYYY/MM/DD'));
    endDate.setDate(endDate.getDate()+1);

    const yesterday = new Date(moment(new Date()).format('YYYY/MM/DD'));
    yesterday.setDate(yesterday.getDate()-1);

    const day = 86400 * 1000;

    const startDate = this.startDate(endDate, this.state.range);

    const ticks = this.getTicks(startDate, endDate, SVGWidth);

    for (const tracker of this.state.trackerAggregation) {
      const { data, created } = tracker;
      const time = new Date(created).getTime();

      if (time < startDate.getTime() || time > endDate.getTime()) {
        continue;
      }

      for (const itemId in data) {
        aggregation[itemId] = aggregation[itemId] || {}

        for (const option in data[itemId]) {
          aggregation[itemId][option] = aggregation[itemId][option] || {}

          let value = data[itemId][option]
          let count = aggregation[itemId][option].count || 0;
          let distress = aggregation[itemId][option].distress || { total: 0, count: 0 }
          let impairment = aggregation[itemId][option].impairment || { total: 0, count: 0 }

          aggregation[itemId][option] = {
            count: count + value.count,
            distress: {
              total: distress.total + value.distress.total,
              count: distress.count + value.distress.count
            },
            impairment: {
              total: impairment.total + value.impairment.total,
              count: impairment.count + value.impairment.count
            }
          }
        }
      }
    }

    return (
      <View style={{ width: windowDimension.width - 50 }}>
        <TokenHeader
          pastTokensLabel={this.getPastTokensLabel()}
          textColor={this.constants.textColor}
          cumulative={this.cumulative}
          tokensYesterday={this.tokensForDateRange(yesterday.getTime(), day)}
        />

        <View>
          {
            !this.state.downloading && (
              <>
                <View style={{
                  width: SVGWidth,
                  height: labelHeight + lineHeight,
                  marginVertical: 10
                }}>
                  {
                    ticks.map((tick, index) => (
                      <View
                        style={{ left: tick.x, position: 'absolute' }}
                        key={index}
                      >
                        <Text style={{ position: 'relative', left: '-50%' }}>{tick.text}</Text>
                        <View style={{ position: 'absolute', left: -1, width: 2, height: lineHeight, backgroundColor: 'grey', bottom: -lineHeight }}></View>
                      </View>
                    ))
                  }
                </View>

                {
                  this.state.range == 'Today' && (
                    <View style={styles.tooltip}>
                      <Text>Today you'll earn at least:</Text>
                      <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                        <Image source={coin} style={{ width: 25, height: 25 }} />
                        <Text style={{ color: '#FDC440' }}>
                          <Text style={{ fontWeight: 'bold' }}>{this.tokensForDateRange(yesterday.getTime() + day, day)}</Text> from {applet.activities.length} {applet.activities.length > 1 ? 'activities' : 'activity'}
                        </Text>
                      </View>
                    </View>
                  ) || <></>
                }

                <Svg
                  width={SVGWidth}
                  height={SVGHeight + 10}
                >
                  <Polygon
                    fill={this.constants.fillColor}
                    points={this.cumulativePolygon(startDate, endDate, SVGWidth, SVGHeight)}
                  />

                  <Path
                    stroke={this.constants.pathColor}
                    strokeWidth={this.constants.strokeWidth}
                    d={this.cumulativePath(startDate, endDate, SVGWidth, SVGHeight)}
                  />

                  <Line x1={0} x2={SVGWidth} y1={SVGHeight+1} y2={SVGHeight+1} stroke={'black'} strokeWidth={1} strokeDasharray={[1, 2]} />

                  {
                    this.state.range == 'Today' &&
                    this.cumulativePoints(startDate, endDate, SVGWidth, SVGHeight)
                      .filter(point => !point.spend && !point.isTracker)
                      .map((point, index) => (
                        <>
                          <Circle
                            key={`circle-${index}`}
                            cx={point.x}
                            cy={SVGHeight}
                            r={7}
                            fill={this.constants.starColor}
                          />
                          <Polygon
                            key={`star-${index}`}
                            points={this.getStarCoordinates(point.x, SVGHeight, 5)}
                            fill={'white'}
                          />
                        </>
                      )) || []
                  }
                </Svg>
              </>
            ) || <ActivityIndicator size="large" />
          }

          <RangeSelector
            value={this.state.range}
            disabled={this.state.downloading}
            onChange={(value) => this.updateRange(value)}
            options={this.availableIntervals.map(option => option.range)}
          />

          {
            !this.state.downloading &&
            <BehaviorAggregation
              aggregation={aggregation}
              pastTokensLabel={this.getPastTokensLabel(false)}
              applet={this.props.applet}
            /> || <></>
          }
        </View>
      </View>
    )
  }
}

TokenChart.propTypes = {
  data: PropTypes.array.isRequired,
  applet: PropTypes.object.isRequired,
  behaviorItems: PropTypes.array.isRequired,
};

const mapStateToProps = state => ({
  authToken: authTokenSelector(state),
});

const mapDispatchToProps = () => ({
})

export default connect(mapStateToProps, mapDispatchToProps)(TokenChart);
