import React from 'react';
import { View, Image } from 'react-native';
import {
  ListItem,
  Text,
  Body,
  Right,
} from 'native-base';
import PropTypes from 'prop-types';
import { CheckBox } from 'react-native-elements';
import { getURL } from '../services/helper';
import { colors } from '../themes/colors';

export class RadioItem extends React.PureComponent {
  render() {
    const { item, value, onChange } = this.props;

    return (
      <ListItem onPress={() => onChange(item.value)}>
        <Body>
          <View style={{ flexDirection: 'row' }}>
            { item.image
              ? (
                <Image
                  style={{ width: 64, height: 64, resizeMode: 'cover' }}
                  source={{ uri: getURL(item.image) }}
                />
              ) : <View />
            }
            <View style={{ justifyContent: 'center' }}>
              <Text>{item.name.en}</Text>
            </View>
          </View>
        </Body>
        <Right>
          <CheckBox
            checked={value === item.value}
            onPress={() => onChange(item.value)}
            checkedIcon="dot-circle-o"
            uncheckedIcon="circle-o"
            checkedColor={colors.primary}
          />
        </Right>
      </ListItem>
    );
  }
}

RadioItem.defaultProps = {
  value: undefined,
};

RadioItem.propTypes = {
  item: PropTypes.object.isRequired,
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
};
