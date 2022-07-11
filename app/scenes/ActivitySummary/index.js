import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import _ from "lodash";
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  Text,
} from "react-native";
import i18n from "i18next";
import BaseText from "../../components/base_text/base_text";
import { newAppletSelector } from "../../state/app/app.selectors";
import { currentAppletResponsesSelector } from "../../state/responses/responses.selectors";
import { getAlertsFromResponse } from "../../services/alert";
import { evaluateReports } from "../../services/scoring";
const alertMessageIcon = require("../../../img/alert-message.png");
const scoreAlertIcon = require("../../../img/score-alert.png");

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 30,
    paddingBottom: 5,
  },
  pageContainer: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "500",
    padding: 20
  },
  alertList: {
    backgroundColor: '#ECDFDF',
    padding: 20,
    borderRadius: 10,
  },
  alertMessage: {
    fontSize: 16
  },
  scoreMessages: {
    borderTopColor: '#E0E0E0',
    borderTopWidth: 1,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 15
  },
  activityTitle: {
    fontWeight: '600',
    fontSize: 25,
  },
});

const ActivitySummary = (props) => {
  const { responses, applet, activity, responseHistory } = props;
  const [alerts, setAlerts] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    let alerts = [], reports = [];
    const activities = activity.isActivityFlow ? applet.activities.filter(act => activity.order.includes(act.name.en)) : [activity];

    for (const activity of activities) {
      reports.push({
        activity,
        data: evaluateReports(responses, activity)
      });

      for (let i = 0; i < responses.length; i++) {
        const item = activity.items[i];

        if (item.valueConstraints) {
          const { responseAlert } = item.valueConstraints;
          if (responses[i] !== null && responses[i] !== undefined && responseAlert) {
            const messages = getAlertsFromResponse(item, responses[i].value !== undefined ? responses[i].value : responses[i]);
            alerts = alerts.concat(messages);
          }
        }
      }
    }

    setAlerts(alerts);
    setReports(reports);
  }, []);

  console.log('alerts', alerts);
  console.log('reports', reports);

  return (
    <>
      <View style={styles.headerContainer}>
        <BaseText
          style={styles.title}
          textKey="activity_summary:report_summary"
        />
      </View>

      <ScrollView scrollEnabled={true} style={styles.pageContainer}>
        <View style={styles.alertList}>
          {
            alerts.map((alert, index) => (
              <View
                key={index}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <Image
                  style={{ marginRight: 10 }}
                  source={alertMessageIcon}
                />
                <Text style={styles.alertMessage}>
                  { alert }
                </Text>
              </View>
            ))
          }
        </View>

        {
          reports.map((report) => (
            <View
              key={report.activity.id}
              style={styles.scoreMessages}
            >
              <Text style={styles.activityTitle}>{report.activity.name.en}</Text>
              {
                report.data.map((score) => (
                  <View
                    style={{
                      flexDirection: 'row', alignItems: 'center', marginVertical: 15
                    }}
                    key={score.label}
                  >
                    {
                      score.flagScore && <Image
                        style={{ marginRight: 7 }}
                        source={scoreAlertIcon}
                      /> || <></>
                    }

                    <Text
                      style={{ fontSize: 18, color: score.flagScore ? '#D17677' : 'black' }}
                    >
                      { score.label }
                    </Text>

                    <View style={{ flexGrow: 1 }}/>

                    <Text
                      style={{ fontSize: 18, color: score.flagScore ? '#D17677' : 'black' }}
                    >
                      { score.score }
                    </Text>
                  </View>
                ))
              }
            </View>
          ))
        }
      </ScrollView>
    </>
  );
};

ActivitySummary.propTypes = {
  responses: PropTypes.array.isRequired,
  activity: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  applet: newAppletSelector(state),
  responseHistory: currentAppletResponsesSelector(state)
});

const mapDispatchToProps = {
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ActivitySummary);
