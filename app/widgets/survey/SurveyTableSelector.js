import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, View } from 'native-base';
import SurveyTableSelectorCell from './SurveyTableSelectorCell';

export default class SurveyTableSelector extends Component {
  constructor(props) {
    super(props);
    const { config: { rows, cols, mode }, answer, onChange } = props;
    // Initialize answer to empty 2D array or 2D array of false
    if (typeof answer === 'undefined') {
      const zeroesAr = mode === 'select'
        ? rows.map(() => [])
        : rows.map(() => cols.map(() => false));
      onChange(zeroesAr);
    }
  }

  onChoiceSelect = (rowIdx, colIdx) => {
    const { answer, config: { optionsMin, optionsMax }, onChange } = this.props;
    const index = answer[rowIdx].indexOf(colIdx);
    if (index < 0) {
      answer[rowIdx].push(colIdx);
    } else {
      answer[rowIdx].splice(index, 1);
    }
    let validate = true;
    answer.forEach((e) => {
      if (e.length < optionsMin || e.length > optionsMax) {
        validate = false;
      }
    });
    onChange(answer, validate);
  }

  render() {
    const { answer, config } = this.props;
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
                <SurveyTableSelectorCell
                  cell={cell}
                  isSelected={answer && answer[rowIdx].includes(colIdx)}
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

SurveyTableSelector.defaultProps = {
  answer: undefined,
};

SurveyTableSelector.propTypes = {
  config: PropTypes.shape({
    rows: PropTypes.arrayOf(PropTypes.array),
    optionsMin: PropTypes.number,
    optionsMax: PropTypes.number,
  }).isRequired,
  answer: PropTypes.arrayOf(PropTypes.array),
  onChange: PropTypes.func.isRequired,
};
