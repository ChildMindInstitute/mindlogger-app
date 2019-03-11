import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, Row, Col, View } from 'native-base';
import styles from './styles';
import SurveyTableInputCell from './SurveyTableInputCell';

const safeAnswer = (answer, rowIdx, colIdx, mode) => {
  if (answer && answer[rowIdx] && answer[rowIdx][colIdx]) {
    return answer[rowIdx][colIdx];
  }
  return mode === 'text' ? '' : 0;
};

export default class SurveyTableInput extends Component {
  updateCells = (newVal, row, col) => {
    const { answer, onChange, config } = this.props;

    const newAnswer = config.rows.map((row, i) => config.cols.map(
      (col, j) => safeAnswer(answer, i, j, config.mode),
    ));
    newAnswer[row][col] = newVal;

    onChange(newAnswer);
  }

  render() {
    const { config, answer } = this.props;
    const cellHeight = 60;
    const cellStyle = {
      cellHeight,
      padding: 4,
      alignItems: 'center',
      alignContent: 'center',
      justifyContent: 'center',
    };
    const rowStyle = {
      cellHeight,
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
                <SurveyTableInputCell
                  mode={config.mode}
                  value={safeAnswer(answer, rowIdx, colIdx, config.mode)}
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

SurveyTableInput.defaultProps = {
  answer: undefined,
};

SurveyTableInput.propTypes = {
  config: PropTypes.shape({
    rows: PropTypes.arrayOf(PropTypes.string),
    cols: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  answer: PropTypes.arrayOf(PropTypes.array),
  onChange: PropTypes.func.isRequired,
};
