import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, View } from 'native-base';
import SurveyTableSelectorCell from './SurveyTableSelectorCell';

export default class SurveyTableSelector extends Component {
  static isValid(answer, { optionsMin = 0, optionsMax = Infinity }) {
    if (!answer) {
      return false;
    }
    for (let i = 0; i < answer.length; i += 1) {
      if (answer[i].length < optionsMin || answer[i].length > optionsMax) {
        return false;
      }
    }
    return true;
  }

  onChoiceSelect = (rowIdx, colIdx) => {
    const { answer, config, onChange } = this.props;

    // Make an empty answer array if answer is undefined
    const newAnswer = answer
      ? [...answer]
      : config.rows.map(() => []);

    // Update with the new response
    const index = newAnswer[rowIdx].indexOf(colIdx);
    if (index < 0) {
      newAnswer[rowIdx].push(colIdx);
    } else {
      newAnswer[rowIdx].splice(index, 1);
    }

    // Check if the user has selected enough items in each row
    onChange(newAnswer);
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
