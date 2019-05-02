import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { SubHeading, NotificationDot, BodyText, TouchBox, LittleHeading } from '../core';
import ActivityDueDate from './ActivityDueDate';
import { colors } from '../../theme';

const styles = StyleSheet.create({
  box: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 12,
    position: 'relative',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textBlock: {
    flex: 1,
    marginLeft: 16,
  },
  notification: {
    position: 'absolute',
    top: 4,
    right: 12,
  },
  sectionHeading: {
    marginTop: 20,
    marginBottom: 0,
    marginLeft: 20,
    marginRight: 20,
    borderBottomWidth: 1,
    borderColor: colors.grey,
    flex: 1,
  },
});

const ActivityRow = ({ activity, onPress }) => {
  if (activity.isHeader === true) {
    return (
      <View style={styles.sectionHeading}>
        <LittleHeading>{activity.text}</LittleHeading>
      </View>
    );
  }
  return (
    <View style={styles.box}>
      <TouchBox onPress={() => onPress(activity)}>
        <SubHeading>
          {activity.name.en}
        </SubHeading>
        <BodyText>
          {activity.description.en}
        </BodyText>
        <ActivityDueDate activity={activity} />
      </TouchBox>
      {activity.isOverdue && (
        <View style={styles.notification}>
          <NotificationDot />
        </View>
      )}
    </View>
  );
};

ActivityRow.propTypes = {
  activity: PropTypes.object.isRequired,
  onPress: PropTypes.func.isRequired,
};

export default ActivityRow;
