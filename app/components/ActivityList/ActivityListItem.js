import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Image } from 'react-native';
import { Icon } from 'native-base';
import TouchBox from '../core/TouchBox';
import { SubHeading, NotificationDot, BodyText, LittleHeading } from '../core';
import ActivityDueDate from './ActivityDueDate';
import TimedActivity from './TimedActivity';
import { colors } from '../../theme';
import theme from '../../themes/base-theme';
import { CachedImage } from 'react-native-img-cache';

import RecomendedBadge from '../../../img/recomended_badge.png'

const badge = require('../../../img/badge.png');
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
  recomendedImage: {
    flex: 0,
    width: 100,
    height: 40,
    resizeMode: 'stretch'
  },
  icon: {
    color: '#AAA',
    fontSize: 18,
  },
});

const ActivityRow = ({ activity, disabled, onPress, onLongPress, isRecommended, orderIndex }) => {
  const isActivityFlow = activity.isActivityFlow ? true : false;
  const activityOrder = orderIndex[activity.id] ? orderIndex[activity.id] : 0;
  
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
            {activity.showBadge && (
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 8 }}>
                <Image
                  source={badge}
                  style={{
                    width: 18,
                    height: 18,
                    opacity: 0.6,
                    right: 2,
                  }}
                />
                <BodyText style={{
                  opacity: (activity.status === 'scheduled' && !activity.event.data.timeout.access) ? 0.5 : 1,
                  color: colors.grey,
                  fontFamily: theme.fontFamily,
                  fontWeight: "bold",
                  fontSize: 15
                }}>
                  {`(${activityOrder + 1} of ${activity.order.length}) ${activity.name}`}
                </BodyText>
              </View>
            )}
            <SubHeading
              style={{
                opacity: (activity.status === 'scheduled' && !activity.event.data.timeout.access) ? 0.5 : 1,
                fontFamily: theme.fontFamily
              }}>
              {isActivityFlow ? activity.order[activityOrder] : activity.name.en}
            </SubHeading>
            {activity.description && (
              <BodyText
                style={{
                  opacity: (activity.status === 'scheduled' && !activity.event.data.timeout.access) ? 0.5 : 1,
                  fontFamily: theme.fontFamily
                }}>
                {isActivityFlow ? activity.description : activity.description.en}
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
          {isRecommended ?
            <Image style={styles.recomendedImage} source={RecomendedBadge} /> : null
          }
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
