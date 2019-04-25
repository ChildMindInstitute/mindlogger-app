import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import TimePicker from './TimePicker';

const defaultTime = { hour: 0, minute: 0 };

export class TimeRange extends React.Component {
  onChangeFrom = (newFromVal) => {
    const { onChange, value } = this.props;
    onChange({
      from: newFromVal,
      to: value ? value.to : defaultTime,
    });
  }

  onChangeTo = (newToVal) => {
    const { onChange, value } = this.props;
    onChange({
      from: value ? value.from : defaultTime,
      to: newToVal,
    });
  }

  render() {
    const { value } = this.props;
    const safeValue = value || {
      from: defaultTime,
      to: defaultTime,
    };
    return (
      <View style={{ alignItems: 'stretch' }}>
        <TimePicker value={safeValue.from} onChange={this.onChangeFrom} label="From" />
        <TimePicker value={safeValue.to} onChange={this.onChangeTo} label="To" />
      </View>
    );
  }
}

TimeRange.defaultProps = {
  value: undefined,
};

TimeRange.propTypes = {
  value: PropTypes.shape({
    from: PropTypes.object,
    to: PropTypes.object,
  }),
  onChange: PropTypes.func.isRequired,
};
