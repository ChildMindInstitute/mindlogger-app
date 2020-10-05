import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Parser } from 'expr-eval';
import { SafeAreaView, View, FlatList, StyleSheet, Text, Dimensions, StatusBar, ImageBackground } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { colors } from '../../themes/colors';
import {
  BodyText,
  Heading,
} from '../../components/core';
import theme from '../../themes/base-theme';
import FunButton from '../../components/core/FunButton';

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    backgroundColor: 'rgba(202, 202, 202, 0.2)'
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
  }
});

const DATA = [
  {
    category: 'Suicide',
    message: 'Critical Level: Parent indicated possible bullying. Bring to immediate attention of clinician due to potential emergency situation.',
    score: '2.00',
  },
  {
    category: 'Emotional',
    message: 'Within normal limits: No further screening or assessment required',
    score: '10.00',
  },
  {
    category: 'Sport',
    message: 'Clinical Range: Make clinician aware; Perform follow up assessment (Recommended); Generate referral',
    score: '4.00',
  },
];

const ActivitySummary = ({ responses, activity }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const activityResponses = [];
    for (let index = 0; index < responses.length; index += 1) {
      activityResponses.push(responses[index] || 0);
    }
    const items = activityResponses.reduce((accumulator, response, index) => {
      return {
        ...accumulator,
        [activity.items[index].variableName]: response || 0,
      }
    }, {});
    const parser = new Parser({
      logical: true,
      comparison: true,
    });

    const itemScores = activity.compute.reduce((accumulator, itemCompute) => {
      let expr = parser.parse(itemCompute.jsExpression);
      return {
        ...accumulator,
        [itemCompute.variableName]: expr.evaluate(items)
      }
    }, {})

    const reportMessages = [];
    activity.messages.forEach(msg => {
      const { jsExpression, message } = msg;
      const expr = parser.parse(jsExpression);
      const category = jsExpression.split(' ')[0];
      if (expr.evaluate(itemScores)) {
        reportMessages.push({
          category,
          message,
          score: itemScores[category]
        })
      }
    })
    setMessages(reportMessages);
  }, [responses])

  const onClose = () => {
    console.log('closed');
    Actions.push('activity_thanks');
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <Text style={{ fontSize: 20, fontWeight: '200' }}>
          {item.category}
        </Text>
        <Text style={{ fontSize: 24, color: colors.tertiary, paddingBottom: 20 }} >
          {item.score}
        </Text>
        <Text style={{ fontSize: 15 }}>
          {item.message}
        </Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.headerContainer}>
        <Text style={{ fontSize: 25, fontWeight: '500' }}>
          Summary
        </Text>
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

const mapDispatchToProps = {
};

export default connect(null, mapDispatchToProps)(ActivitySummary);
