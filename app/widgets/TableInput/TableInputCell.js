import React from 'react';
import PropTypes from 'prop-types';
import { Text, Button, View, Input } from 'native-base';
import styles from './styles';

const onNumberAdd = (toAdd, oldVal = 0, onChange) => {
  onChange(oldVal + toAdd);
};

const TableInputCell = ({ freeEntry = false, value = '', onChange }) => {
  if (freeEntry) {
    return (
      <View style={styles.textViewStyle}>
        <Input
          placeholder=""
          onChangeText={onChange}
          value={value}
        />
      </View>
    );
  }
  return (
    <Button
      bordered
      style={{ width: '100%' }}
      delayLongPress={600}
      onPress={() => { onNumberAdd(1, value, onChange); }}
      onLongPress={() => { if(value) onNumberAdd(-1, value, onChange); }}
    >
      <Text style={styles.cellTextStyle}>{value}</Text>
    </Button>
  );
};

TableInputCell.defaultProps = {
  value: '',
  freeEntry: false,
};

TableInputCell.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  onChange: PropTypes.func.isRequired,
  freeEntry: PropTypes.bool,
};

export default TableInputCell;
