import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getScoreFromResponse, evaluateScore, getMaxScore } from '../../services/scoring';
import { Parser } from 'expr-eval';

import {
  SafeAreaView,
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import i18n from 'i18next';
import { colors } from '../../themes/colors';
import BaseText from '../../components/base_text/base_text';
import { BodyText, Heading } from '../../components/core';
import theme from '../../themes/base-theme';
import FunButton from '../../components/core/FunButton';

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    backgroundColor: 'rgba(202, 202, 202, 0.2)',
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 15,
  },
  itemContainer: {
    width,
    paddingTop: 20,
    paddingRight: 35,
    paddingLeft: 35,
    paddingBottom: 20,
    marginBottom: 2,
    backgroundColor: 'white',
    alignContent: 'center',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
});

const DATA = [
  {
    category: i18n.t('activity_summary:category_suicide'),
    message: i18n.t('activity_summary:category_suicide_message'),
    score: '2.00',
  },
  {
    category: i18n.t('activity_summary:category_emotional'),
    message: i18n.t('activity_summary:category_emotional_message'),
    score: '10.00',
  },
  {
    category: i18n.t('activity_summary:sport'),
    message: i18n.t('activity_summary:category_sport_message'),
    score: '4.00',
  },
];

const ActivitySummary = ({ responses, activity }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const parser = new Parser({
      logical: true,
      comparison: true,
    });

    let scores = [], maxScores = [];
    for (let i = 0; i < activity.items.length; i++) {
      let score = getScoreFromResponse(activity.items[i], responses[i]);
  
      scores.push(score);

      maxScores.push(getMaxScore(activity.items[i]))
    }

    const cumulativeScores = activity.compute.reduce((accumulator, itemCompute) => {
      return {
        ...accumulator,
        [itemCompute.variableName.trim().replace(/\s/g, '__')]: evaluateScore(itemCompute.jsExpression, activity.items, scores),
      };
    }, {});

    const cumulativeMaxScores = activity.compute.reduce((accumulator, itemCompute) => {
      return {
        ...accumulator,
        [itemCompute.variableName.trim().replace(/\s/g, '__')]: evaluateScore(itemCompute.jsExpression, activity.items, maxScores),
      };
    }, {});

    const reportMessages = [];
    activity.messages.forEach((msg) => {
      const { jsExpression, message, outputType } = msg;

      const variableName = jsExpression.split(/[><]/g)[0];
      const category = variableName.trim().replace(/\s/g, '__');
      const expr = parser.parse(category + jsExpression.substr(variableName.length));

      if (expr.evaluate(cumulativeScores)) {
        reportMessages.push({
          category,
          message,
          score: (outputType == 'percentage' ? Math.round(cumulativeMaxScores[category] ? cumulativeScores[category] * 100 / cumulativeMaxScores[category] : 0) + '%' : cumulativeScores[category]),
        });
      }
    });

    setMessages(reportMessages);
  }, [responses]);

  const onClose = () => {
    console.log('closed');
    Actions.push('activity_thanks');
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <BaseText style={{ fontSize: 20, fontWeight: '200' }}>
          {item.category.replace(/_/g, ' ')}
        </BaseText>
        <BaseText style={{ fontSize: 24, color: colors.tertiary, paddingBottom: 20 }}>
          {item.score}
        </BaseText>
        <BaseText style={{ fontSize: 15 }}>{item.message}</BaseText>
      </View>
    );
  };

  return (
    <>
      <View style={styles.headerContainer}>
        <BaseText style={{ fontSize: 25, fontWeight: '500' }} textKey="activity_summary:summary" />
      </View>
      <FlatList
        data={messages}
        renderItem={renderItem}
        contentContainerStyle={styles.container}
        keyExtractor={item => item.category}
      />
    </>
  );
};

ActivitySummary.propTypes = {
  responses: PropTypes.array.isRequired,
  activity: PropTypes.object.isRequired,
};

const mapDispatchToProps = {};

export default connect(
  null,
  mapDispatchToProps,
)(ActivitySummary);
