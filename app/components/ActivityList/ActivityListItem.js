import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { Icon } from 'native-base';
import { SubHeading, NotificationDot, BodyText, TouchBox, LittleHeading, Hyperlink } from '../core';
import ActivityDueDate from './ActivityDueDate';
import { colors } from '../../theme';
import theme from '../../themes/base-theme';

const styles = StyleSheet.create({
  box: {
    position: 'relative',
    fontFamily: theme.fontFamily,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    fontFamily: theme.fontFamily,
  },
  textBlock: {
    flex: 1,
    marginLeft: 16,
    fontFamily: theme.fontFamily,
  },
  sectionHeading: {
    marginTop: 20,
    marginBottom: 0,
    marginLeft: 20,
    marginRight: 20,
    borderBottomWidth: 1,
    borderColor: colors.grey,
    flex: 1,
    fontFamily: theme.fontFamily,
  },
  moreInfo: {
    marginTop: 16,
    width: 'auto',
  },
  layout: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  left: {
    flex: 1,
  },
  right: {
    flex: 0,
    paddingLeft: 16,
  },
  icon: {
    color: '#AAA',
    fontSize: 18,
  },
});

const ActivityRow = ({ activity, onPress }) => {
  if (activity.isHeader === true) {
    return (
      <View style={styles.sectionHeading}>
        <LittleHeading style={{ color: colors.grey }}>{activity.text}</LittleHeading>
      </View>
    );
  }
  return (
    <View style={styles.box}>
      <TouchBox onPress={() => onPress(activity)}>
        <View style={styles.layout}>
          <View style={styles.left}>
            <SubHeading style={{ fontFamily: theme.fontFamily }}>
              {activity.name.en}
            </SubHeading>
            {activity.description && (
              <BodyText style={{ fontFamily: theme.fontFamily }}>
                {activity.description.en}
              </BodyText>
            )}
            <ActivityDueDate activity={activity} />
            {/* <Hyperlink
              style={styles.moreInfo}
              onPress={() => Actions.push('activity_details')}
            >
              Details
            </Hyperlink> */}
          </View>
          <View style={styles.right}>
            <Icon type="FontAwesome" name="chevron-right" style={styles.icon} />
          </View>
        </View>
      </TouchBox>
      {activity.isOverdue && (
        <NotificationDot />
      )}
    </View>
  );
};

ActivityRow.propTypes = {
  activity: PropTypes.object.isRequired,
  onPress: PropTypes.func.isRequired,
};

export default ActivityRow;
