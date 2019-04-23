import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { Text } from 'native-base';
import Slider from './slider';

const SliderWidget = ({ config: { maxValue, minValue, itemList }, value, onChange }) => (
  <View style={{ alignItems: 'stretch', flex: 1 }}>
    <Text style={{ textAlign: 'center' }}>{maxValue}</Text>
    <Slider
      value={value || 0}
      min={1}
      max={itemList.length || 100}
      labels={itemList.map(item => ({ text: item.name.en }))}
      strict
      barHeight={200}
      selected={!!value}
      onChange={onChange}
    />
    <Text style={{ textAlign: 'center' }}>{minValue}</Text>
  </View>
);

SliderWidget.defaultProps = {
  value: undefined,
};

SliderWidget.propTypes = {
  config: PropTypes.shape({
    minValue: PropTypes.string,
    maxValue: PropTypes.string,
    itemList: PropTypes.array,
  }).isRequired,
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
};

export default SliderWidget;
