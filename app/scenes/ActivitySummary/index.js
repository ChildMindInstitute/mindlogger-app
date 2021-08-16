import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Parser } from 'expr-eval';
import _ from 'lodash';

import {
  SafeAreaView,
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  StatusBar,
  ImageBackground,
  AsyncStorage,
  TouchableOpacity,
  Text,
  Image,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import i18n from 'i18next';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import RNFetchBlob from "rn-fetch-blob";
const fs = RNFetchBlob.fs;
import path from 'path';
import Markdown, { MarkdownIt, renderRules, tokensToAST, stringToTokens } from 'react-native-markdown-display';
import markdownContainer from 'markdown-it-container';
import markdownIns from 'markdown-it-ins';

import { getURL } from '../../services/helper';
import { colors } from '../../themes/colors';
import BaseText from '../../components/base_text/base_text';
import { BodyText, Heading } from '../../components/core';
import theme from '../../themes/base-theme';
import FunButton from '../../components/core/FunButton';
import { MarkdownScreen } from '../../components/core';
import { newAppletSelector } from '../../state/app/app.selectors';
import { parseAppletEvents } from '../../models/json-ld';
import { setActivities, setCumulativeActivities } from '../../state/activities/activities.actions';
import { getScoreFromResponse, evaluateScore, getMaxScore } from '../../services/scoring';

const img_score = require('../../../img/score_bar.png');
const markdownItInstance = MarkdownIt({ typographer: true })
  .use(markdownContainer)
  .use(markdownContainer, 'hljs-left') /* align left */
  .use(markdownContainer, 'hljs-center')/* align center */
  .use(markdownContainer, 'hljs-right')/* align right */
  .use(markdownIns);

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
  shareButton: {
    paddingTop: 20,
    paddingLeft: 35,
  },
  shareButtonText: {
    fontSize: 20,
    fontWeight: '400',
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

const termsText = "I understand that the information provided by this questionnaire is not intended to replace the advice, diagnosis, or treatment offered by a medical or mental health professional, and that my anonymous responses may be used and shared for general research on children’s mental health.";
const footerText = "CHILD MIND INSTITUTE, INC. AND CHILD MIND MEDICAL PRACTICE, PLLC (TOGETHER, “CMI”) DOES NOT DIRECTLY OR INDIRECTLY PRACTICE MEDICINE OR DISPENSE MEDICAL ADVICE AS PART OF THIS QUESTIONNAIRE. CMI ASSUMES NO LIABILITY FOR ANY DIAGNOSIS, TREATMENT, DECISION MADE, OR ACTION TAKEN IN RELIANCE UPON INFORMATION PROVIDED BY THIS QUESTIONNAIRE, AND ASSUMES NO RESPONSIBILITY FOR YOUR USE OF THIS QUESTIONNAIRE.";

const ActivitySummary = ({ responses, activity, applet, setActivities, activities, setCumulativeActivities }) => {
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
    activity.messages.forEach(async (msg) => {
      const { jsExpression, message, outputType, nextActivity } = msg;
      const variableName = jsExpression.split(/[><]/g)[0];
      const category = variableName.trim().replace(/\s/g, '__');
      const expr = parser.parse(category + jsExpression.substr(variableName.length));

      const variableScores = {
        [category]: outputType == 'percentage' ? Math.round(cumulativeMaxScores[category] ? cumulativeScores[category] * 100 / cumulativeMaxScores[category] : 0) : cumulativeScores[category]
      }

      if (expr.evaluate(variableScores)) {
        if (nextActivity)
          setCumulativeActivities({ [`${activity.id}/nextActivity`]: nextActivity })

        const compute = activity.compute.find(itemCompute => itemCompute.variableName.trim() == variableName.trim())

        reportMessages.push({
          category,
          message,
          score: variableScores[category] + (outputType == 'percentage' ? '%' : ''),
          compute,
        });
      }
    });

    setMessages(reportMessages);
  }, [responses]);

  const onClose = () => {
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
        <MarkdownScreen>{item.message}</MarkdownScreen>
      </View>
    );
  };

  const shareReport = async () => {
    const options = {
      html: '',
      fileName: 'report',
      directory: 'Documents',
    };

    options.html += `
      <p class="text-decoration-underline font-weight-bold mb-4">
        ${ _.get(activity, 'name.en') } Report
      </p>
      <p class="text-body-2 mb-4">
        ${ markdownItInstance.render(activity.scoreOverview) }
      </p>
    `

    for (const message of messages) {
      options.html += `
        <p class="blue--text font-weight-bold mb-1">
          ${ message.category.replace(/_/g, ' ') }
        </p>
        <p class="text-body-2 mb-4">
          ${ markdownItInstance.render(message.compute.description) }
        </p>
        <p class="text-body-2 mb-4">
          ${ message.score }
        </p>
        <p class="text-body-2 mb-4">
          ${ markdownItInstance.render(message.message) }
        </p>
      `
    }
    options.html += `
      <p class="text-footer text-body-2 mb-5">
        ${ termsText }
      </p>
      <p class="text-footer">
        ${ footerText }
      </p>
    `

    options.html += `
      <style>
        html {
          font-size: 32pt;
        }
        .cumulative-score-report {
          width: 600px;
        }
        .text-decoration-underline {
          text-decoration: underline;
        }
        .text-uppercase {
          text-transform: uppercase;
        }
        .font-weight-bold {
          font-weight: bold;
        }
        .font-italic {
          font-style: italic;
        }
        .text-body-2 {
          font-size: 0.9rem;
        }
        .blue--text {
          color: #2196f3;
        }
        .mb-1 {
          margin-bottom: 0.25em;
        }
        .ml-2 {
          margin-left: 0.5em;
        }
        .mb-4 {
          margin-bottom: 1em;
        }
        .my-4 {
          margin-top: 1em;
          margin-bottom: 1em;
        }
        .mb-5 {
          margin-bottom: 2em;
        }
        .score-bar {
          width: 400px;
        }
        .text-footer {
          line-height: 2em;
        }
        .score-bar.reverse{
          -webkit-transform: scaleX(-1);
          transform: scaleX(-1);
        }
      </style>
    `

    const file = await RNHTMLtoPDF.convert(options)
    FileViewer.open(file.filePath);
  }

  return (
    <>
      <View style={styles.headerContainer}>
        <BaseText style={{ fontSize: 25, fontWeight: '500' }} textKey="activity_summary:summary" />
      </View>
      <TouchableOpacity
        style={styles.shareButton}
        onPress={shareReport}
      >
        <Text style={styles.shareButtonText}>Share Report</Text>
      </TouchableOpacity>
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
})

const mapDispatchToProps = {
  setActivities,
  setCumulativeActivities
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ActivitySummary);
