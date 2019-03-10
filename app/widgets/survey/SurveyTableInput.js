import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, Row, Col, View } from 'native-base';
import styles from './styles';
import SurveyTableInputCell from './SurveyTableInputCell';

export default class SurveyTableInput extends Component {
  componentDidMount() {
    const { config, answer, onChange } = this.props;
    const { rows, cols } = config;

    // Initialize answer to zeros or empty strings if nothing set
    if (!answer) {
      const initialState = config.mode === 'text'
        ? rows.map(() => cols.map(() => ''))
        : rows.map(() => cols.map(() => 0));
      onChange(initialState);
    }
  }

  updateCell = (newVal, row, col) => {
    const { answer, onChange } = this.props;
    answer[row][col] = newVal;
    onChange(answer);
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
            {config.cols.map((col, colIdx) => {
              return (
                <Col key={colIdx} style={cellStyle}>
                  <SurveyTableInputCell
                    mode={config.mode}
                    value={answer ? answer[rowIdx][colIdx] : undefined}
                    onChange={(newVal) => {
                      this.updateCell(newVal, rowIdx, colIdx);
                    }}
                  />
                </Col>
              );
            })}
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
