import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, Image } from 'react-native';
import { Text, Button } from 'native-base';
import styles from './styles';
import { getURL } from '../../services/helper';

const TableSelectorCell = ({ cell, isSelected = false, onPress, height = 60 }) => {
  const imageStyle = {
    width: (height - 6),
    height: (height - 6),
    padding: 3,
  };
  switch (cell.type) {
    case 'text':
      return (
        <Button
          style={styles.buttonStyle}
          transparent={!isSelected}
          onPress={onPress}
        >
          <Text>{cell.text}</Text>
        </Button>
      );
    case 'file':
      return (
        <TouchableOpacity onPress={onPress}>
          <Image
            style={imageStyle}
            source={{ uri: getURL(cell.file) }}
          />
        </TouchableOpacity>
      );
    default:
      return (<Text />);
  }
};

TableSelectorCell.defaultProps = {
  isSelected: false,
  height: 60,
};

TableSelectorCell.propTypes = {
  cell: PropTypes.shape({
    file: PropTypes.number,
    text: PropTypes.string,
    type: PropTypes.string,
  }).isRequired,
  onPress: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
  height: PropTypes.number,
};

export default TableSelectorCell;
