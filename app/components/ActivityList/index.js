import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import sortActivities from './sortActivities';
import ActivityListItem from './ActivityListItem';

const ActivityList = ({ applet, inProgress, onPressActivity }) => {
  const [activities, setActivities] = useState([]);
  useEffect(() => {
    setActivities(sortActivities(applet.activities, inProgress, applet.schedule));
  }, []);

  return (
    <View style={{ paddingBottom: 30 }}>
      {activities.map(activity => (
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
