import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, Row, Col, View } from 'native-base';
import i18n from 'i18next';
import styles from './styles';
import TableInputCell from './TableInputCell';

const safeValue = (value, rowIdx, colIdx, freeEntry) => {
  if (value && value[rowIdx] && value[rowIdx][colIdx]) {
    return value[rowIdx][colIdx];
  }
  return freeEntry ? '' : 0;
};

export class TableInput extends Component {
  updateCells = (newVal, row, col) => {
    const { value, onChange, config, freeEntry } = this.props;

    const newValue = config.rows.map((row, i) => config.cols.map((col, j) => safeValue(value, i, j, freeEntry)));
    newValue[row][col] = newVal;

    onChange(newValue);
  };

  render() {
    const { config, value, freeEntry } = this.props;
    const cellHeight = 60;
    const cellStyle = {
      cellHeight,
      padding: 4,
      alignItems: 'center',
      alignContent: 'center',
      justifyContent: 'center',
    };
    const infoStyle = {
      paddingTop: 20,
    };
    const rowStyle = {
      height: cellHeight,
    };
    this.imageStyle = {
      width: cellHeight - 3,
      height: cellHeight - 3,
      padding: 3,
    };
    return (
      <View>
        <Row style={styles.rowStyle}>
          <Col style={cellStyle}>
            <Text style={styles.cellTextStyle}> </Text>
          </Col>
          {config.cols.map((col, idx) => (
            <Col key={idx} style={styles.cellStyle}>
              <Text style={styles.cellTextStyle}>{col.value}</Text>
            </Col>
          ))}
        </Row>
        {config.rows.map((row, rowIdx) => (
          <Row style={rowStyle} key={rowIdx}>
            <Col style={cellStyle}>
              <Text>{row.value}</Text>
            </Col>
            {config.cols.map((col, colIdx) => (
              <Col key={colIdx} style={cellStyle}>
                <TableInputCell
                  freeEntry={freeEntry}
                  value={safeValue(value, rowIdx, colIdx, freeEntry)}
                  onChange={(newVal) => {
                    this.updateCells(newVal, rowIdx, colIdx);
                  }}
                />
              </Col>
            ))}
          </Row>
        ))}
        <View style={infoStyle}>
          <Text style={styles.cellTextStyle}> {i18n.t('table_input:short_press_detail')}</Text>
          <Text style={styles.cellTextStyle}> {i18n.t('table_input:long_press_detail')}</Text>
        </View>
        )}
      </View>
    );
  }
}

TableInput.defaultProps = {
  value: undefined,
  freeEntry: false,
};

TableInput.propTypes = {
  config: PropTypes.shape({
    rows: PropTypes.arrayOf(PropTypes.object),
    cols: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  value: PropTypes.arrayOf(PropTypes.array),
  onChange: PropTypes.func.isRequired,
  freeEntry: PropTypes.bool,
};
