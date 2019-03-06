import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity } from 'react-native';
import { Text, Button } from 'native-base';
import styles from './styles';
import GImage from '../../components/image/Image';

const SurveyTableSelectorCell = ({ cell, isSelected = false, onPress, height = 60 }) => {
  const imageStyle = {
    width: (height - 3),
    height: (height - 3),
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
          <GImage
            style={imageStyle}
            file={cell.file}
          />
        </TouchableOpacity>
      );
    default:
      return (<Text />);
  }
};

SurveyTableSelectorCell.defaultProps = {
  isSelected: false,
  height: 60,
};

SurveyTableSelectorCell.propTypes = {
  cell: PropTypes.shape({
    file: PropTypes.number,
    text: PropTypes.string,
    type: PropTypes.string,
  }).isRequired,
  onPress: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
  height: PropTypes.number,
};

export default SurveyTableSelectorCell;
