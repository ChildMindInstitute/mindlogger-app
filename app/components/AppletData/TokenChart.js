import React from 'react';
import PropTypes from 'prop-types';
import { Dimensions } from 'react-native';
import { Svg, G, Line, Text, Rect } from 'react-native-svg';
import * as d3 from 'd3';

const colors = {
  axis: '#3F3F3F',
  tickLine: '#F2F2F2',
  bars: 'rgb(50, 160, 50)',
};

// deprecated
// eslint-disable-next-line
class TokenChart extends React.Component {

  render() {
    const { data } = this.props;
    const SVGHeight = Math.round(Dimensions.get('window').width * 0.95);
    const SVGWidth = Math.round(Dimensions.get('window').height * 0.6);
    const GRAPH_MARGIN = 15;
    const GRAPH_BAR_WIDTH = 25;
    const graphHeight = SVGHeight - 2 * GRAPH_MARGIN;
    const graphWidth = SVGWidth - 2 * GRAPH_MARGIN;

    // Y scale linear
    const maxValue = d3.max(data, d => Math.abs(d.value));
    const topValue = maxValue < 5 ? 5 : Math.ceil(maxValue / 5) * 5;
    console.log('max', data, topValue)
    const yDomain = [0, topValue * 2];
    const yRange = [0, graphHeight];
    const y = d3
      .scaleLinear()
      .domain(yDomain)
      .range(yRange);

    // X scale point
    const xDomain = data.map(item => item.name);
    const xRange = [0, graphWidth];
    const x = d3
      .scalePoint()
      .domain(xDomain)
      .range(xRange)
      .padding(2);

    const tickSize = (topValue > 9) ? (topValue > 24 ? 10 : 5) : 5;
    const ticks = Array.from(Array(Math.ceil(topValue / tickSize) + 1).keys()).slice(1);

    // top axis and middle axis

    return (
      <Svg width={SVGWidth} height={SVGHeight}>
        <G y={graphHeight + GRAPH_MARGIN}>
          {/* axis */}
          <Line
            x1="45"
            y1={y(topValue) * -1}
            x2={graphWidth - 20}
            y2={y(topValue) * -1}
            stroke={colors.axis}
            strokeWidth="1.5"
          />
          <Line
            x1="50"
            y1="0"
            x2="50"
            y2={y(topValue * 2) * -1}
            stroke={colors.axis}
            strokeWidth="1.5"
          />

          {/* ticks */}
          <Text
            x="40"
            textAnchor="end"
            y={y(topValue) * -1 + 3}
            fontSize={10}
            fill="black"
            fillOpacity={1}
          >
            {0}
          </Text>

          {ticks.map(tick => (
            <>
              <Line
                x1="50"
                y1={y(topValue + tick * 5) * -1}
                x2={graphWidth - 20}
                y2={y(topValue + tick * 5) * -1}
                stroke={colors.tickLine}
                strokeDasharray={[3, 3]}
                strokeWidth="1.5"
              />
              <Line
                x1="50"
                y1={y(topValue - tick * 5) * -1}
                x2={graphWidth - 20}
                y2={y(topValue - tick * 5) * -1}
                stroke={colors.tickLine}
                strokeDasharray={[3, 3]}
                strokeWidth="1.5"
              />
              <Text
                x="40"
                textAnchor="end"
                y={y(topValue + tick * 5) * -1 + 3}
                fontSize={10}
                fill="black"
                fillOpacity={1}
              >
                {`${tick * tickSize}`}
              </Text>
              <Line
                x1="45"
                y1={y(topValue + tick * 5) * -1}
                x2="50"
                y2={y(topValue + tick * 5) * -1}
                stroke={colors.axis}
                strokeWidth="1.5"
              />
              <Text
                x="40"
                textAnchor="end"
                y={y(topValue - tick * 5) * -1 + 3}
                fontSize={10}
                fill="black"
                fillOpacity={1}
              >
                {`${tick * tickSize * -1}`}
              </Text>
              <Line
                x1="45"
                y1={y(topValue - tick * 5) * -1}
                x2="50"
                y2={y(topValue - tick * 5) * -1}
                stroke={colors.axis}
                strokeWidth="1.5"
              />
            </>
          ))}

          {/* bars */}
          {data.map((item) => {
            const r = item.value < 0
              ? 250
              : 207 - Math.floor((207 / maxValue) * item.value);
            const g = item.value < 0
              ? 250 + Math.floor((150 / maxValue) * item.value)
              : 220;
            const b = item.value < 0
              ? 250 + Math.floor((150 / maxValue) * item.value)
              : 228 - Math.floor((118 / maxValue) * item.value);
            return (
              <>
                <Rect
                  key={`bar${item.name}`}
                  x={x(item.name) - GRAPH_BAR_WIDTH / 3 + 15}
                  y={
                    y(
                      topValue
                        + (item.value < 0
                          ? -0.01 * tickSize
                          : item.value + 0.01 * tickSize),
                    ) * -1
                  }
                  rx={0}
                  width={GRAPH_BAR_WIDTH}
                  height={y(Math.abs(item.value))}
                  fill={`rgb(${r} , ${g}, ${b})`}
                />
                <Text
                  key={`label${item.name}`}
                  fontSize="10"
                  x={x(item.name) - GRAPH_BAR_WIDTH / 3 + 27}
                  y={y(topValue + Math.abs(item.value)) * -1 - 2}
                  textAnchor="middle"
                  fill="black"
                  fillOpacity={1}
                >
                  {item.value ? item.value : ''}
                </Text>
              </>
            );
          })}

          {/* labels */}
          {data.map(item => (
            <Text
              key={`label${item.name}`}
              fontSize="10"
              x={x(item.name) + 20}
              y={y(topValue) * -1 + 10}
              textAnchor="middle"
              fill="black"
              fillOpacity={1}
            >
              {item.name}
            </Text>
          ))}
        </G>
      </Svg>
    );
  }
}

TokenChart.propTypes = {
  data: PropTypes.array.isRequired,
};

export default TokenChart;
