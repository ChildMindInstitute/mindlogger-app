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
    fontSize: 16,
  },
  alertsTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 10
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
  const { responses, applet, activity, responseHistory, flow } = props;
  const [alerts, setAlerts] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    let alerts = [], reports = [];
    const activities = flow ? applet.activities.filter(act => flow.order.includes(act.name.en)) : [activity];

    for (const activity of activities) {
      if (activity.summaryDisabled) {
        continue;
      }

      let lastResponse = [];
      if (activity.id == props.activity.id) {
        lastResponse = responses;
      } else {
        for (let item of activity.items) {
          const itemResponses = responseHistory.responses[item.schema];

          if (itemResponses && itemResponses.length) {
            lastResponse.push(itemResponses[itemResponses.length-1]);
          } else {
            lastResponse.push(null);
          }
        }
      }

      reports.push({
        activity,
        data: evaluateReports(lastResponse, activity)
      });

      for (let i = 0; i < lastResponse.length; i++) {
        const item = activity.items[i];

        if (item.valueConstraints) {
          const { responseAlert } = item.valueConstraints;
          if (lastResponse[i] !== null && lastResponse[i] !== undefined && responseAlert) {
            const messages = getAlertsFromResponse(item, lastResponse[i].value !== undefined ? lastResponse[i].value : lastResponse[i]);
            alerts = alerts.concat(messages);
          }
        }
      }
    }

    setAlerts(alerts);
    setReports(reports.filter(report => report.data.length > 0));
  }, []);

  return (
    <>
      <View style={styles.headerContainer}>
        <BaseText
          style={styles.title}
          textKey="activity_summary:report_summary"
        />
      </View>

      <ScrollView scrollEnabled={true} style={styles.pageContainer}>
        <View style={alerts.length ? styles.alertList : {}}>
          {
            alerts.length ? <Text style={styles.alertsTitle}>Alerts</Text> : <></>
          }
          {
            alerts.map((alert, index) => (
              <View
                key={index}
                style={{ flexDirection: 'row', alignItems: 'center', marginRight: 25 }}
              >
                <Image
                  style={{ marginRight: 10, marginTop: 2 }}
                  source={alertMessageIcon}
                />
                <Text
                  style={styles.alertMessage}
                >
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
                      style={{ fontSize: 18, color: score.flagScore ? '#D33134' : 'black' }}
                    >
                      { score.label }
                    </Text>

                    <View style={{ flexGrow: 1 }}/>

                    <View
                      style={{
                        borderRadius: 10,
                        paddingHorizontal: 40,
                        paddingVertical: 5,
                        backgroundColor: score.flagScore ? '#FFE2E2' : 'white'
                      }}
                    >
                      <Text
                        style={[
                          score.flagScore ? { color: '#D33134', fontWeight: 'bold' } : {},
                          { fontSize: 22 },
                        ]}
                      >
                        {Math.round(score.score * 10000) / 10000 }
                      </Text>
                    </View>
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
  flow: PropTypes.object.isRequired,
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
