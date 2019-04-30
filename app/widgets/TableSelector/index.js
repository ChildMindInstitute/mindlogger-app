import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, View } from 'native-base';
import TableSelectorCell from './TableSelectorCell';

export class TableSelector extends Component {
  static isValid(value, { optionsMin = 0, optionsMax = Infinity }) {
    if (!value) {
      return false;
    }
    for (let i = 0; i < value.length; i += 1) {
      if (value[i].length < optionsMin || value[i].length > optionsMax) {
        return false;
      }
    }
    return true;
  }

  onChoiceSelect = (rowIdx, colIdx) => {
    const { value, config, onChange } = this.props;

    // Make an empty answer array if answer is undefined
    const newValue = value
      ? [...value]
      : config.rows.map(() => []);

    // Update with the new response
    const index = newValue[rowIdx].indexOf(colIdx);
    if (index < 0) {
      newValue[rowIdx].push(colIdx);
    } else {
      newValue[rowIdx].splice(index, 1);
    }

    // Check if the user has selected enough items in each row
    onChange(newValue);
  }

  render() {
    const { value, config } = this.props;
    const height = 60;
    // if(this.state.dimensions && config.mode == 'select') {
    //   height = this.state.dimensions.width/(config.colsCount + 1)
    // }

    const cellStyle = {
      height,
      padding: 4,
      alignItems: 'center',
      alignContent: 'center',
      justifyContent: 'center',
    };
    const rowStyle = {
      height,
    };
    return (
      <View>
        {config.rows.map((cols, rowIdx) => (
          <Row style={rowStyle} key={rowIdx}>
            {cols.map((cell, colIdx) => (
              <Col key={colIdx} style={cellStyle}>
                <TableSelectorCell
                  cell={cell}
                  isSelected={value && value[rowIdx].includes(colIdx)}
                  onPress={() => {
                    this.onChoiceSelect(rowIdx, colIdx);
                  }}
                  height={height}
                />
              </Col>
            ))}
          </Row>
        ))}
      </View>
    );
  }
}

TableSelector.defaultProps = {
  value: undefined,
};

TableSelector.propTypes = {
  config: PropTypes.shape({
    rows: PropTypes.arrayOf(PropTypes.array),
    optionsMin: PropTypes.number,
    optionsMax: PropTypes.number,
  }).isRequired,
  value: PropTypes.arrayOf(PropTypes.array),
  onChange: PropTypes.func.isRequired,
};
