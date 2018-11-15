import React from "react";
import PropTypes from 'prop-types';
import {
  PanResponder,
  Text
} from "react-native";
import styled from "styled-components";

const CIRCLE_DIAMETER = 50;

export default class Slider extends React.Component {
  static propTypes = {
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    labels: PropTypes.array,
    strict: PropTypes.bool
  }

  state = {
    barHeight: 200,
    deltaValue: 0,
    value: 0,
  };

  componentWillMount() {
    this.setState({value: this.props.value});
  }

  panResponder = PanResponder.create({
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderMove: (_, gestureState) => this.onMove(gestureState),
    onPanResponderRelease: () => this.onEndMove(),
    onPanResponderTerminate: () => {}
  });

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
      deltaValue: newDeltaValue
    });
  }
  onEndMove() {
    const { strict, onChange } = this.props;
    let { value, deltaValue } = this.state;
    value = value + deltaValue
    this.setState({ value, deltaValue: 0 });
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
    const { min, max, labels, strict } = this.props;

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
      <PageContainer>
        
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
            <Circle
              bottomOffset={bottomOffset}
              {...this.panResponder.panHandlers}
            />
            
          </BarContainer>
          
        </Container>
      </PageContainer>
    );
  }
}

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
  border-color: black;
  border-width: 1;
`;

const Circle = styled.View`
  border-radius: ${CIRCLE_DIAMETER / 2};
  width: ${CIRCLE_DIAMETER};
  height: ${CIRCLE_DIAMETER};
  background-color: black;
  position: absolute;
  bottom: ${props => props.bottomOffset};
`;

const LabelContainer = styled.View`
  width: 50%;
  height: 100%;
  left: 50%;
  padding-left: 40;
  padding-top: 20;
  padding-bottom: 20;
  position: absolute;
  justify-content: space-between;
  flex-direction: column-reverse;
`;