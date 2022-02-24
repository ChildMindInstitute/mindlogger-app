import React, { useRef } from 'react';
import * as R from 'ramda';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import moment from 'moment';
import { MarkdownScreen } from '../core';
import { markdownStyle } from '../../themes/activityTheme';
import { replaceItemVariableWithName } from '../../services/helper';

const styleLens = R.lensPath(['paragraph', 'fontWeight']);
const preambleStyle = R.set(styleLens, 'bold', markdownStyle);

const styles = StyleSheet.create({
  infoTitle: {
    textAlign: 'center',
    borderWidth: 1,
  },
});

const parseMarkdown = (markdown, lastResponseTime, profile, activity, answers) => {
  if (!lastResponseTime) {
    markdown = replaceItemVariableWithName(markdown, activity, answers)
    return markdown.replace(/\[Nickname\]/i, profile.nickName || '');
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
  markdownSplit.forEach((element, index) => {
    if (element?.includes('[Time_Activity_Last_Completed] to [Now]')) {
      markdownSplit[index] = `[blue]${markdownSplit[index]}`
      markdown = markdownSplit.join('\n');
    }
  });

  markdown = replaceItemVariableWithName(markdown, activity, answers);ƒ
  return markdown
    .replace(/\[Now\]/i, moment(now).format('hh:mm A') + ' today (now)')
    .replace(/\[Time_Elapsed_Activity_Last_Completed\]/i, formatElapsedTime(now.getTime() - responseTime.getTime()))
    .replace(/\[Time_Activity_Last_Completed\]/i, formatLastResponseTime(responseTime, moment(now)))
    .replace(/\[Nickname\]/i, profile.nickName || profile.firstName);
};

const ScreenDisplay = ({ activity, lastResponseTime, profile, answers, currentScreen, screen }) => {
  const { question, inputType, preamble, info } = screen;
  const markdown = useRef(parseMarkdown(question && question.en || '', lastResponseTime[activity.id] || null, profile, activity, answers)).current;

  let heightProp;

  if (inputType === 'tokenSummary') {
    heightProp = {
      height: 78,
    };
  }

  return (
    <View style={{ marginBottom: 18 }}>
      {preamble && (
        <MarkdownScreen mstyle={preambleStyle}>
          {preamble.en}
        </MarkdownScreen>
      )}
      {inputType !== "trail" && (
        <MarkdownScreen {...heightProp} >
          {inputType === 'futureBehaviorTracker' || inputType == 'pastBehaviorTracker' ?
              `::: hljs-left\r\n${markdown}\r\n:::` : markdown}
        </MarkdownScreen>
      )}
      {info && (
        <View style={styles.infoTitle}>
          <MarkdownScreen>
            {info.en}
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
  activity: PropTypes.object.isRequired,
  answers: PropTypes.array,
  currentScreen: PropTypes.number,
};

export default ScreenDisplay;
