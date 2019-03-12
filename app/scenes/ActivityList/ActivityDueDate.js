import React from 'react';
import PropTypes from 'prop-types';
import { Text } from 'native-base';
import moment from 'moment';

const formatTime = (timestamp) => {
  const time = moment(timestamp);
  if (moment().isSame(time, 'day')) {
    return moment(timestamp).format('[Today at] h:mm A');
  }
  return moment(timestamp).format('MMMM D');
}

const textStyles = {
  fontSize: 12,
  marginTop: 3,
  color: 'grey',
};

const ActivityDueDate = ({ activity }) => {
  if (activity.lastResponseTimestamp < activity.lastScheduledTimestamp) {
    return (
      <Text style={{ ...textStyles, color: '#CC2211' }}>
        {formatTime(activity.lastScheduledTimestamp)}
      </Text>
    );
  }
  if (activity.status === 'scheduled') {
    return <Text style={textStyles}>{formatTime(activity.nextScheduledTimestamp)}</Text>;
  }
  if (activity.status === 'completed') {
    return <Text style={textStyles}>Last completed: {formatTime(activity.lastResponseTimestamp)}</Text>;
  }
  return <Text style={textStyles} />;
};

ActivityDueDate.propTypes = {
  activity: PropTypes.object.isRequired,
}

export default ActivityDueDate;
