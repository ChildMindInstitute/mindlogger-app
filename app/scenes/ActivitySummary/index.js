import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Parser } from 'expr-eval';
import _ from 'lodash';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';

import { colors } from '../../themes/colors';
import { MarkdownScreen } from '../../components/core';
import { parseAppletEvents } from '../../models/json-ld';
import BaseText from '../../components/base_text/base_text';
import { newAppletSelector } from '../../state/app/app.selectors';
import { setActivities, setCumulativeActivities } from '../../state/activities/activities.actions';
import { getScoreFromResponse, evaluateScore, getMaxScore } from '../../services/scoring';

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

const ActivitySummary = ({ responses, activity, applet, cumulativeActivities, setCumulativeActivities }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const parser = new Parser({
      logical: true,
      comparison: true,
    });

    const newApplet = parseAppletEvents(applet);

    let scores = [], maxScores = [];
    for (let i = 0; i < activity.items.length; i++) {
      if (!activity.items[i] || !responses[i]) continue;

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
    let cumActivities = [];
    activity.messages.forEach(async (msg, i) => {
      const { jsExpression, message, outputType, nextActivity } = msg;
      const variableName = jsExpression.split(/[><]/g)[0];
      const category = variableName.trim().replace(/\s/g, '__');
      const expr = parser.parse(category + jsExpression.substr(variableName.length));

      const variableScores = {
        [category]: outputType == 'percentage' ? Math.round(cumulativeMaxScores[category] ? cumulativeScores[category] * 100 / cumulativeMaxScores[category] : 0) : cumulativeScores[category]
      }

      if (expr.evaluate(variableScores)) {
        if (nextActivity) cumActivities.push(nextActivity);

        reportMessages.push({
          category,
          message,
          score: variableScores[category] + (outputType == 'percentage' ? '%' : ''),
        });
      }
    });

    if (cumulativeActivities[`${activity.id}/nextActivity`]) {
      cumActivities = _.difference(cumActivities, cumulativeActivities[`${activity.id}/nextActivity`]);
      if (cumActivities.length > 0) {
        cumActivities = [...cumulativeActivities[`${activity.id}/nextActivity`], ...cumActivities];
        setCumulativeActivities({ [`${activity.id}/nextActivity`]: cumActivities });
      }
    } else {
      setCumulativeActivities({ [`${activity.id}/nextActivity`]: cumActivities });
    }

    setMessages(reportMessages);
  }, [responses]);

  const renderItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <BaseText style={{ fontSize: 20, fontWeight: '200' }}>
          {item.category.replace(/_/g, ' ')}
        </BaseText>
        <BaseText style={{ fontSize: 24, color: colors.tertiary, paddingBottom: 20 }}>
          {item.score}
        </BaseText>
        <MarkdownScreen>{item.message}</MarkdownScreen>
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

const mapStateToProps = (state) => ({
  applet: newAppletSelector(state),
  activities: state.activities.activities,
  cumulativeActivities: state.activities.cumulativeActivities,
})

const mapDispatchToProps = {
  setActivities,
  setCumulativeActivities
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ActivitySummary);
