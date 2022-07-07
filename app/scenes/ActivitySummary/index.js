import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Parser } from "expr-eval";
import _ from "lodash";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
} from "react-native";
import i18n from "i18next";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import FileViewer from "react-native-file-viewer";
import { MarkdownIt } from "react-native-markdown-display";
import markdownContainer from "markdown-it-container";
import markdownIns from "markdown-it-ins";
import markdownEmoji from "markdown-it-emoji";
import markdownMark from "markdown-it-mark";
import moment from "moment";
import Mimoza from "mimoza";
import { colors } from "../../themes/colors";
import { MarkdownScreen } from "../../components/core";
import BaseText from "../../components/base_text/base_text";
import { newAppletSelector } from "../../state/app/app.selectors";
import { currentAppletResponsesSelector } from "../../state/responses/responses.selectors";
import { setActivities } from "../../state/activities/activities.actions";
import { evaluateCumulatives } from "../../services/scoring";

let markdownItInstance = MarkdownIt({ typographer: true })
  .use(markdownContainer)
  .use(markdownContainer, "hljs-left") /* align left */
  .use(markdownContainer, "hljs-center") /* align center */
  .use(markdownContainer, "hljs-right") /* align right */
  .use(markdownIns)
  .use(markdownMark);

if (Platform.Version != 26) {
  markdownItInstance = markdownItInstance.use(markdownEmoji);
}

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 30,
    paddingBottom: 15,
  },
  shareButton: {
    paddingHorizontal: 5,
    marginTop: 10,
  },
  shareButtonText: {
    fontSize: 20,
    fontWeight: "400",
    color: "#0067A0",
  },
  pageContainer: {
    paddingHorizontal: 35,
  },
  itemContainer: {
    paddingVertical: 20,
    backgroundColor: "white",
    alignContent: "center",
    alignItems: "flex-start",
    justifyContent: "center",
  },
});

const DATA = [
  {
    category: i18n.t("activity_summary:category_suicide"),
    message: i18n.t("activity_summary:category_suicide_message"),
    score: "2.00",
  },
  {
    category: i18n.t("activity_summary:category_emotional"),
    message: i18n.t("activity_summary:category_emotional_message"),
    score: "10.00",
  },
  {
    category: i18n.t("activity_summary:sport"),
    message: i18n.t("activity_summary:category_sport_message"),
    score: "4.00",
  },
];

const ActivitySummary = (props) => {
  const [reports, setReports] = useState([]);
  const { responses, applet, activity, responseHistory } = props;
  const termsText = i18n.t("activity_summary:terms_text");
  const footerText = i18n.t("activity_summary:footer_text");

  useEffect(() => {
    setReports(reports);
  }, []);

  return (
    <>
      <View style={styles.headerContainer}>
        <BaseText style={{ fontSize: 25, fontWeight: "500", alignSelf: "center" }} textKey="activity_summary:summary" />
      </View>
      <ScrollView scrollEnabled={true} style={styles.pageContainer}>
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
  activities: state.activities.activities,
  responseHistory: currentAppletResponsesSelector(state)
});

const mapDispatchToProps = {
  setActivities,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ActivitySummary);
