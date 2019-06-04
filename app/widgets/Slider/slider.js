import React from "react";
import PropTypes from 'prop-types';
import {
  PanResponder,
  Text
} from "react-native";
import styled from "styled-components";

const CIRCLE_DIAMETER = 25;

export default class Slider extends React.Component {
  static propTypes = {
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    labels: PropTypes.array,
    strict: PropTypes.bool,
    value: PropTypes.number.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      barHeight: 200,
      deltaValue: 0,
      value: this.props.value,
    };
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        this.props.onPress();
        return true;
      },
      onPanResponderMove: (evt, gestureState) => {
        return this.onMove(gestureState);
      },
      onPanResponderRelease: (evt, gestureState) => {
        this.onEndMove();
        this.props.onRelease();
      },
    });
  }

  onMove(gestureState) {
    const { barHeight } = this.state;
    const { min, max } = this.props;
    const newDeltaValue = this.getValueFromBottomOffset(
      -gestureState.dy,
      barHeight,
      min,
      max
    );

    this.setState({
      deltaValue: newDeltaValue,
      selected: true
    });
  }
  onEndMove() {
    const { strict, min, max, onChange } = this.props;
    let { value, deltaValue } = this.state;
    value = this.capValueWithinRange(value + deltaValue, [
      min,
      max
    ]);
    this.setState({ value, deltaValue: 0, selected: false });
    if (strict)
      onChange(Math.floor(value));
    else
      onChange(value);
  }

  onBarLayout = (event) => {
    const { height: barHeight } = event.nativeEvent.layout;
    this.setState({ barHeight });
  };

  capValueWithinRange = (value, range) => {
    if (value < range[0]) return range[0];
    if (value > range[1]) return range[1];
    return value;
  };

  getValueFromBottomOffset = (
    offset,
    barHeight,
    rangeMin,
    rangeMax
  ) => {
    if (barHeight === null) return 0;
    return ((rangeMax - rangeMin) * offset) / barHeight;
  };

  getBottomOffsetFromValue = (
    value,
    rangeMin,
    rangeMax,
    barHeight
  ) => {
    if (barHeight === null) return 0;
    const valueOffset = value - rangeMin;
    const totalRange = rangeMax - rangeMin;
    const percentage = valueOffset / totalRange;
    return barHeight * percentage;
  };

  render() {
    const { value, deltaValue, barHeight } = this.state;
    const { min, max, labels, strict, selected } = this.props;

    const cappedValue = this.capValueWithinRange(value + deltaValue, [
      min,
      max
    ]);
    let offset = strict ? Math.floor(cappedValue) : cappedValue
    const bottomOffset = this.getBottomOffsetFromValue(
      offset,
      min,
      max,
      barHeight
    );
    return (
      <PageContainer {...this.panResponder.panHandlers}>

        <Container>
          {labels &&
            <LabelContainer>
              {
                labels.map((label, idx) =>
                  <Text key={idx}>{label.text}</Text>
                )
              }
            </LabelContainer>
          }

          <BarContainer>
            <Bar onLayout={this.onBarLayout} />
            <RoundRect
              bottomOffset={bottomOffset}
              isFilled={selected || this.state.selected}
            />

          </BarContainer>

        </Container>
      </PageContainer>
    );
  }
}

const borderColor = 'rgb(189, 193, 204)';
const sliderFillColor = 'rgb(39,103,155)';

const PageContainer = styled.View`
  background-color: white;
  flex-grow: 1;
  align-self: stretch;
  align-items: center;
  padding-vertical: 20;
`;

const Container = styled.View`
  flex-grow: 1;
  align-self: stretch;
  justify-content: center;
  flex-direction: row;
`;
const Value = styled.Text`
  color: black;
`;

const BarContainer = styled.View`
  width: ${CIRCLE_DIAMETER};
  align-items: center;
  padding-vertical: ${CIRCLE_DIAMETER / 2};
  margin-horizontal: 20;
`;
const Bar = styled.View`
  width: 10;
  background-color: white;
  flex-grow: 1;
  border-radius: 8;
  border-color: ${borderColor};
  background-color: ${borderColor};
  border-width: 1;
`;

const Circle = styled.View`
  border-radius: ${CIRCLE_DIAMETER / 2};
  width: ${CIRCLE_DIAMETER};
  height: ${CIRCLE_DIAMETER};
  background-color: ${props => props.isFilled ? '#0B3954' : 'white'};
  border-color: ${borderColor};
  position: absolute;
  bottom: ${props => props.bottomOffset};
`;

const RoundRect = styled.View`
  border-radius: 8;
  width: ${CIRCLE_DIAMETER * 2};
  height: ${CIRCLE_DIAMETER};
  background-color: ${props => props.isFilled ? sliderFillColor : 'white'};
  border-color: ${sliderFillColor};
  border-width: 3;
  position: absolute;
  bottom: ${props => props.bottomOffset};
`;

const LabelContainer = styled.View`
  width: 50%;
  height: 100%;
  left: 50%;
  padding-left: 40;
  padding-top: 0;
  padding-bottom: 0;
  position: absolute;
  justify-content: space-between;
  flex-direction: column-reverse;
`;
