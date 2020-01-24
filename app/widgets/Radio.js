import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { RadioItem as Item } from '../components/RadioItem';

export class Radio extends React.PureComponent {
  render() {
    const { value, config, onChange } = this.props;

    return (
      <View style={{ alignItems: 'stretch' }}>
        {
          config.itemList.map((item, index) => (
            <Item value={value} item={item} index={index} onChange={onChange} />
          ))
        }
      </View>
    );
  }
}

Radio.defaultProps = {
  value: undefined,
};

Radio.propTypes = {
  value: PropTypes.any,
  config: PropTypes.shape({
    itemList: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.object,
      value: PropTypes.any,
      image: PropTypes.string,
    })).isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};
