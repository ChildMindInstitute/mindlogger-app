import React from 'react';
import PropTypes from 'prop-types';
import { Text, Button, View, Input } from 'native-base';
import styles from './styles';

const onNumberAdd = (toAdd, oldVal = 0, onChange) => {
  onChange(oldVal + toAdd);
};

const SurveyTableInputCell = ({ mode = 'text', value = '', onChange }) => {
  if (mode === 'number') {
    return (
      <Button
        bordered
        style={{ width: '100%' }}
        delayLongPress={600}
        onPress={() => { onNumberAdd(1, value, onChange); }}
        onLongPress={() => { onNumberAdd(-1, value, onChange); }}
      >
        <Text style={styles.cellTextStyle}>{value}</Text>
      </Button>
    );
  }
  return (
    <View style={styles.textViewStyle}>
      <Input
        placeholder=""
        onChangeText={onChange}
        value={value}
      />
    </View>
  );
};

SurveyTableInputCell.defaultProps = {
  value: '',
};

SurveyTableInputCell.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  onChange: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
};

export default SurveyTableInputCell;
