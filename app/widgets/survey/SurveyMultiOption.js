import React from 'react';
import PropTypes from 'prop-types';
import { ListItem, Text, Right, Body, CheckBox, Radio } from 'native-base';
import GImage from '../../components/image/Image';

const Option = ({ row, onPress, isRadio = false, isSelected = false }) => (
  <ListItem onPress={onPress}>
    <Body>
      {row.type == 'text' && <Text>{row.text}</Text>}
      {row.type == 'file' && <GImage file={row.file} style={{ width: '60%', height: 100, resizeMode: 'cover' }} />}
    </Body>
    <Right>
      {isRadio
        ? <Radio onPress={onPress} selected={isSelected} />
        : <CheckBox onPress={onPress} checked={isSelected} />}
    </Right>
  </ListItem>
);

Option.propTypes = {
  row: PropTypes.shape({
    type: PropTypes.string.isRequired,
    text: PropTypes.string,
    file: PropTypes.number,
  }).isRequired,
  onPress: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
  isRadio: PropTypes.bool,
};

export default Option;
