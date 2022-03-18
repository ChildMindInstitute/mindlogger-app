import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { Icon } from 'native-base';
import TouchBox from '../core/TouchBox';
import { SubHeading, NotificationDot, BodyText, LittleHeading } from '../core';
import ActivityDueDate from './ActivityDueDate';
import TimedActivity from './TimedActivity';
import { colors } from '../../theme';
import theme from '../../themes/base-theme';
import { CachedImage } from 'react-native-img-cache';

const styles = StyleSheet.create({
  box: {
    position: 'relative',
    fontFamily: theme.fontFamily,
    marginBottom: 20,
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
    marginTop: 0,
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
  image: {
    flex: 0,
    marginRight: 16,
    width: 64,
    height: 64,
    resizeMode: 'cover',
    borderRadius: 32
  },
  icon: {
    color: '#AAA',
    fontSize: 18,
  },
});

const ActivityRow = ({ activity, disabled, onPress, onLongPress }) => {
  if (activity.isHeader === true) {

      return (
        <View style={styles.sectionHeading}>
          {!!activity.text &&
            <LittleHeading style={{ color: colors.grey }}>{activity.text}</LittleHeading>
          }
        </View>
      );

  }
  return (
    <View style={styles.box}>
      <TouchBox
        disabled={disabled}
        activityStatus={activity.status}
        onPress={() => onPress(activity)}
        onLongPress={() => onLongPress(activity)}
      >
        <View style={styles.layout}>
          {
            activity.image &&
            <CachedImage
              style={styles.image}
              source={{ uri: activity.image }}
            /> || <></>
          }
          <View style={styles.left}>
            <SubHeading
              style={{
                opacity: (activity.status === 'scheduled' && !activity.event.data.timeout.access) ? 0.5 : 1,
                fontFamily: theme.fontFamily
              }}>
              {activity.name.en}
            </SubHeading>
            {activity.description && (
              <BodyText
                style={{
                  opacity: (activity.status === 'scheduled' && !activity.event.data.timeout.access) ? 0.5 : 1,
                  fontFamily: theme.fontFamily
                }}>
                {activity.description.en}
              </BodyText>
            ) || <></>}
            <ActivityDueDate activity={activity} />
            <TimedActivity activity={activity} />
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
        <NotificationDot onPress={() => onPress(activity)} />
      )}
    </View>
  );
};

ActivityRow.propTypes = {
  activity: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  onPress: PropTypes.func.isRequired,
  onLongPress: PropTypes.func.isRequired,
};

export default ActivityRow;
