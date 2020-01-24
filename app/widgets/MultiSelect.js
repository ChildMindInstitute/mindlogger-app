import React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import { MultiItem as Item } from '../components/MultiItem';

export class MultiSelect extends React.PureComponent {
  static isValid(value = [], { minValue = 1, maxValue = Infinity }) {
    if (!value
      || value.length < minValue
      || value.length > maxValue) {
      return false;
    }
    return true;
  }

  onAnswer = (itemVal) => {
    const { value, onChange, config } = this.props;
    if (!value || (config.maxValue === 1 && config.minValue === 1)) {
      onChange([itemVal]);
    } else if (value.includes(itemVal)) {
      const answerIndex = value.indexOf(itemVal);
      onChange(R.remove(answerIndex, 1, value));
    } else {
      onChange(R.append(itemVal, value));
    }
  }

  render() {
    const { config: { itemList }, value = [] } = this.props;
    return (
      <View style={{ alignItems: 'stretch' }}>
        {
          itemList.map((item, index) => (
            <Item key={index} value={value} item={item} onAnswer={this.onAnswer} />
          ))
        }
      </View>
    );
  }
}

MultiSelect.defaultProps = {
  value: undefined,
};

MultiSelect.propTypes = {
  config: PropTypes.shape({
    itemList: PropTypes.array,
    minValue: PropTypes.number,
    maxValue: PropTypes.number,
  }).isRequired,
  value: PropTypes.array,
  onChange: PropTypes.func.isRequired,
};
