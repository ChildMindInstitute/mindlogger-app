import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import sortActivities from './sortActivities';
import ActivityListItem from './ActivityListItem';

const ActivityList = ({ activities, inProgress, onPressActivity }) => {
  const list = sortActivities(activities, inProgress);
  return (
    <View style={{ paddingBottom: 30 }}>
      {list.map(activity => (
        <ActivityListItem
          onPress={() => onPressActivity(activity)}
          activity={activity}
          key={activity.id || activity.text}
        />
      ))}
    </View>
  );
};

ActivityList.propTypes = {
  applet: PropTypes.object.isRequired,
  inProgress: PropTypes.object.isRequired,
  onPressActivity: PropTypes.func.isRequired,
};

export default ActivityList;
