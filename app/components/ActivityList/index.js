import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import sortActivities from './sortActivities';
import ActivityListItem from './ActivityListItem';
import { Heading } from '../core';

const ActivityList = ({ applet, inProgress, onPressActivity }) => {
  const activities = sortActivities(applet.activities, inProgress);
  return (
    <View style={{ paddingBottom: 30 }}>
      <Heading style={{ paddingLeft: 20, marginTop: 30 }}>Activities</Heading>
      {activities.map(activity => (
        <ActivityListItem
          onPress={() => onPressActivity(activity)}
          activity={activity}
          key={activity.id}
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
