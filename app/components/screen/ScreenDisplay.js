import React, { useRef } from 'react';
import * as R from 'ramda';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { MarkdownScreen } from '../core';
import { markdownStyle } from '../../themes/activityTheme';
import moment from 'moment';

const styleLens = R.lensPath(['paragraph', 'fontWeight']);
const preambleStyle = R.set(styleLens, 'bold', markdownStyle);

const styles = StyleSheet.create({
  infoTitle: {
    textAlign: 'center',
    borderWidth: 1,
  },
});

const parseMarkdown = (markdown, lastResponseTime, profile) => {
  if (!lastResponseTime) {
    return markdown.replace(/\[Nickname\]/i, profile.nickName || profile.firstName);
  }

  const now = new Date();
  const responseTime = moment.utc(lastResponseTime).toDate();

  const formatElapsedTime = (timeElapsed) => {
    const totalMinutes = Math.floor(timeElapsed / 1000 / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);

    let str = '';
    if (hours > 0) {
      str = hours == 1 ? `hour` : `${hours} hours`;
    }

    if (minutes > 0) {
      if (str.length) {
        str += ' and ';
      }

      str += minutes == 1 ? 'one minute' : minutes == 59 ? "hour" : `${minutes} minutes`;
    }

    if (!str.length) {
      return 'minute'
    }
    return str;
  };

  const formatLastResponseTime = (time, now) => {
    const responseTime = moment(time);
    if (responseTime.isSame(now, 'day')) {
      return responseTime.format('hh:mm A') + ' today';
    } else if (responseTime.add(1, 'days').isSame(now, 'day')) {
      return responseTime.format('hh:mm A') + ' yesterday';
    }

    return moment(time).format('hh:mm A DD/MM');
  }

  const markdownSplit = markdown?.split('\n');
  if (markdownSplit?.includes('[Time_Activity_Last_Completed] to [Now]')) {
    const index = markdownSplit.findIndex(v => v === '[Time_Activity_Last_Completed] to [Now]');
    markdownSplit[index] = `[blue]${markdownSplit[index]}`
    markdown = markdownSplit.join('\n');
  }

  return markdown
    .replace(/\[Now\]/i, moment(now).format('hh:mm A') + ' today (now)')
    .replace(/\[Time_Elapsed_Activity_Last_Completed\]/i, formatElapsedTime(now.getTime() - responseTime.getTime()))
    .replace(/\[Time_Activity_Last_Completed\]/i, formatLastResponseTime(responseTime, moment(now)))
    .replace(/\[Nickname\]/i, profile.nickName || profile.firstName);
};

const ScreenDisplay = ({ screen, activity, lastResponseTime, profile }) => {
  const markdown = useRef(parseMarkdown(screen.question && screen.question.en || '', lastResponseTime[activity.id] || null, profile)).current;

  return (
    <View style={{ marginBottom: 18 }}>
      {screen.preamble && (
        <MarkdownScreen mstyle={preambleStyle}>
          {screen.preamble.en}
        </MarkdownScreen>
      )}
      {screen.inputType !== "trail" && (
        <MarkdownScreen height={78}>
          {screen.inputType === 'futureBehaviorTracker' || screen.inputType == 'pastBehaviorTracker' ?
              `::: hljs-left\r\n${markdown}\r\n:::` : markdown}
        </MarkdownScreen>
      )}
      {screen.info && (
        <View style={styles.infoTitle}>
          <MarkdownScreen>
            {screen.info.en}
          </MarkdownScreen>
        </View>
      )}
    </View>
  )
}

ScreenDisplay.propTypes = {
  screen: PropTypes.object.isRequired,
  lastResponseTime: PropTypes.object.isRequired,
  profile: PropTypes.object.isRequired,
  activity: PropTypes.object.isRequired
};

export default ScreenDisplay;
