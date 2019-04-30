import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, Row, Col, View } from 'native-base';
import styles from './styles';
import TableInputCell from './TableInputCell';

const safeValue = (value, rowIdx, colIdx, mode) => {
  if (value && value[rowIdx] && value[rowIdx][colIdx]) {
    return value[rowIdx][colIdx];
  }
  return mode === 'text' ? '' : 0;
};

export class TableInput extends Component {
  updateCells = (newVal, row, col) => {
    const { value, onChange, config } = this.props;

    const newValue = config.rows.map((row, i) => config.cols.map(
      (col, j) => safeValue(value, i, j, config.mode),
    ));
    newValue[row][col] = newVal;

    onChange(newValue);
  }

  render() {
    const { config, value } = this.props;
    const cellHeight = 60;
    const cellStyle = {
      cellHeight,
      padding: 4,
      alignItems: 'center',
      alignContent: 'center',
      justifyContent: 'center',
    };
    const rowStyle = {
      height: cellHeight,
    };
    this.imageStyle = {
      width: (cellHeight - 3),
      height: (cellHeight - 3),
      padding: 3,
    };
    return (
      <View>
        <Row style={styles.rowStyle}>
          <Col style={cellStyle}><Text style={styles.cellTextStyle}>{' '}</Text></Col>
          {config.cols.map(
            (col, idx) => (
              <Col key={idx} style={styles.cellStyle}>
                <Text style={styles.cellTextStyle}>{col}</Text>
              </Col>
            ),
          )}
        </Row>
        {config.rows.map((row, rowIdx) => (
          <Row style={rowStyle} key={rowIdx}>
            <Col style={cellStyle}>
              <Text>{row}</Text>
            </Col>
            {config.cols.map((col, colIdx) => (
              <Col key={colIdx} style={cellStyle}>
                <TableInputCell
                  mode={config.mode}
                  value={safeValue(value, rowIdx, colIdx, config.mode)}
                  onChange={(newVal) => {
                    this.updateCells(newVal, rowIdx, colIdx);
                  }}
                />
              </Col>
            ))}
          </Row>
        ))}
      </View>
    );
  }
}

TableInput.defaultProps = {
  value: undefined,
};

TableInput.propTypes = {
  config: PropTypes.shape({
    rows: PropTypes.arrayOf(PropTypes.string),
    cols: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  value: PropTypes.arrayOf(PropTypes.array),
  onChange: PropTypes.func.isRequired,
};
