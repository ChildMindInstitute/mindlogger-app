import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { Text } from 'native-base';
import SliderComponent from './slider';

export const Slider = ({ config: { maxValue, minValue, itemList }, value, onChange }) => (
  <View style={{ alignItems: 'stretch', flex: 1 }}>
    <Text style={{ textAlign: 'center' }}>{maxValue}</Text>
    <SliderComponent
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

Slider.defaultProps = {
  value: undefined,
};

Slider.propTypes = {
  config: PropTypes.shape({
    minValue: PropTypes.string,
    maxValue: PropTypes.string,
    itemList: PropTypes.array,
  }).isRequired,
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
};
