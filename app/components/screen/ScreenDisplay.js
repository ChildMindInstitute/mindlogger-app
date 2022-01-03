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

const parseMarkdown = (markdown, lastResponseTime) => {
  if (!lastResponseTime) {
    return markdown;
  }

  const now = new Date();
  const responseTime = moment.utc(lastResponseTime).toDate();

  const formatElapsedTime = (timeElapsed) => {
    const totalMinutes = Math.floor(timeElapsed / 1000 / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);

    let str = '';
    if (hours > 0) {
      str = hours == 1 ? `an hour` : `${hours} hours`;
    }

    if (minutes > 0) {
      if (str.length) {
        str += ' and ';
      }

      str += minutes == 1 ? 'one minute' : `${minutes} minutes`;
    }

    if (!str.length) {
      return 'just now'
    }
    return str;
  };

  const formatLastResponseTime = (responseTime, now) => {
    if (responseTime.isSame(now, 'day')) {
      return responseTime.format('hh:mm A') + ' today';
    } else if (responseTime.add(1, 'days').isSame(now, 'day')) {
      return responseTime.format('hh:mm A') + ' yesterday';
    }

    return responseTime.format('hh:mm A');
  }

  return markdown
          .replace(/\[Now\]/i, moment(now).format('hh:mm A') + ' today')
          .replace(/\[Time_Elapsed_Activity_Last_Completed\]/i, formatElapsedTime(now.getTime() - responseTime.getTime()))
          .replace(/\[Time_Activity_Last_Completed\]/i, formatLastResponseTime(moment(responseTime), moment(now)));
};

const ScreenDisplay = ({ screen, activity, lastResponseTime }) => {
  const markdown = useRef(parseMarkdown(screen.question && screen.question.en || '', lastResponseTime[activity.id] || null)).current;

  return (
    <View style={{ marginBottom: 18 }}>
      {screen.preamble && (
        <MarkdownScreen mstyle={preambleStyle}>
          {screen.preamble.en}
        </MarkdownScreen>
      )}
      <MarkdownScreen>
        {
          screen.inputType === 'futureBehaviorTracker' || screen.inputType == 'pastBehaviorTracker' ?
          `::: hljs-left\r\n${markdown}\r\n:::` : markdown
        }
      </MarkdownScreen>
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
  activity: PropTypes.object.isRequired
};

export default ScreenDisplay;
