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
} from "react-native";
import i18n from "i18next";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import FileViewer from "react-native-file-viewer";
import { MarkdownIt } from "react-native-markdown-display";
import markdownContainer from "markdown-it-container";
import markdownIns from "markdown-it-ins";
import markdownEmoji from "markdown-it-emoji";
import markdownMark from "markdown-it-mark";
import Mimoza from "mimoza";
import { colors } from "../../themes/colors";
import { MarkdownScreen } from "../../components/core";
import BaseText from "../../components/base_text/base_text";
import { newAppletSelector } from "../../state/app/app.selectors";
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
    paddingHorizontal: 35,
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

const termsText =
  "I understand that the information provided by this questionnaire is not intended to replace the advice, diagnosis, or treatment offered by a medical or mental health professional, and that my anonymous responses may be used and shared for general research on children’s mental health.";
const footerText =
  "CHILD MIND INSTITUTE, INC. AND CHILD MIND MEDICAL PRACTICE, PLLC (TOGETHER, “CMI”) DOES NOT DIRECTLY OR INDIRECTLY PRACTICE MEDICINE OR DISPENSE MEDICAL ADVICE AS PART OF THIS QUESTIONNAIRE. CMI ASSUMES NO LIABILITY FOR ANY DIAGNOSIS, TREATMENT, DECISION MADE, OR ACTION TAKEN IN RELIANCE UPON INFORMATION PROVIDED BY THIS QUESTIONNAIRE, AND ASSUMES NO RESPONSIBILITY FOR YOUR USE OF THIS QUESTIONNAIRE.";

const ActivitySummary = (props) => {
  const [messages, setMessages] = useState([]);
  const { responses, applet, activity } = props;

  useEffect(() => {
    let { reportMessages } = evaluateCumulatives(responses, activity)
    setMessages(reportMessages);
  }, [responses]);

  const fRequestAndroidPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error("fRequestAndroidPermission error:", err);
      return false;
    }
  };

  const shareReport = async () => {
    if (Platform.OS === "android") {
      const permissionGranted = await fRequestAndroidPermission();
      if (!permissionGranted) {
        console.log("access was refused");
        return;
      }
    }

    const options = {
      html: "",
      fileName: "report",
      directory: "Documents",
      width: 800,
      height: 1000,
      padding: 80,
      bgColor: "#ffffff",
    };

    const isSplashScreen = activity.splash && activity.splash.en;

    if (applet.image) {
      options.html += `
        <div style="float: right; margin-left: 10px">
          <img
            src="${applet.image}"
            height="100"
            alt=''
          />
        </div>
      `;
    }

    if (isSplashScreen) {
      const uri = activity.splash.en;
      const mimeType = Mimoza.getMimeType(uri) || "";

      if (!mimeType.startsWith("video/")) {
        options.html += `
          <div style="height: 100%;">
            <img style="width: 100%" src="${uri}" alt="Splash Activity">
          </div>
        `;
      }
    }

    options.html += `
      <p class="text-body-2 mb-4">
        ${markdownItInstance.render(activity?.scoreOverview)}
      </p>
    `;

    for (const message of messages) {
      options.html += `
        <p class="blue--text mb-1">
          <b>
            ${message.category.replace(/_/g, " ")}
          </b>
        </p>
        <p class="text-body-2">
          ${markdownItInstance.render(message.compute.description)}
        </p>
        <div class="score-area">
          <p
            class="score-title text-nowrap"
            style="left: max(170px, ${(message.scoreValue / message.maxScoreValue) * 100}%)"
          >
            <b>
              Your Child' Score
            </b>
          </p>
          <div
            class="score-bar score-below ${message.compute.direction ? "score-positive" : "score-negative"}"
            style="width: ${(message.exprValue / message.maxScoreValue) * 100}%"
          ></div>
          <div
            class="score-bar score-above ${!message.compute.direction ? "score-positive" : "score-negative"}"
          ></div>
          <div
            class="score-spliter"
            style="left: ${(message.scoreValue / message.maxScoreValue) * 100}%"
          ></div>
          <p class="score-max-value">
            <b>
              ${message.maxScoreValue}
            </b>
          </p>
        </div>
        <p class="text-body-2 mb-4">
          Your child’s score on the
          ${message.category.replace(/_/g, " ")}
           subscale was <span class="text-danger">${message.scoreValue}</span>.
          ${markdownItInstance.render(message.message)}
        </p>
      `;
    }
    options.html += `
      <div class="divider-line"></div>
      <p class="text-footer text-body-2 mb-5">
        ${termsText}
      </p>
      <p class="text-footer text-body-2">
        ${footerText}
      </p>
    `;

    options.html += `
      <style>
        html {
          font-size: 24pt;
          font-family: Arial, Helvetica, sans-serif;
        }
        .hljs-left {
          text-align: left;
        }
        .hljs-center {
          text-align: center;
        }
        .hljs-right {
          text-align: right;
        }
        .text-uppercase {
          text-transform: uppercase;
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
        .text-footer {
          line-height: 2em;
        }
        .text-nowrap {
          white-space: nowrap;
        }
        .text-danger {
          color: #ff0000;
        }

        .score-area {
          position: relative;
          display: flex;
          width: 100%;
          max-width: 600px;
          padding: 4rem 0 2rem;
        }
        .score-bar {
          height: 3rem;
        }
        .score-positive {
          background-color: #a1cd63;
        }
        .score-negative {
          background-color: #b02318;
        }
        .score-above {
          flex: 1;
        }
        .score-spliter {
          position: absolute;
          top: 2.5rem;
          width: .2rem;
          height: 6rem;
          background-color: #000;
        }
        .divider-line {
          border: 1px solid black;
        }
        .score-title {
          position: absolute;
          top: 0;
          transform: translateX(-50%);
        }
        .score-max-value {
          position: absolute;
          margin: 0;
          right: 0;
          bottom: 0;
        }
        img {
          max-width: 100%;
        }
      </style>
    `;

    const file = await RNHTMLtoPDF.convert(options);
    FileViewer.open(file.filePath);
  };

  return (
    <>
      <View style={styles.headerContainer}>
        <BaseText style={{ fontSize: 25, fontWeight: "500", alignSelf: "center" }} textKey="activity_summary:summary" />
        <TouchableOpacity style={styles.shareButton} onPress={shareReport}>
          <Text style={styles.shareButtonText}>Share Report</Text>
        </TouchableOpacity>
      </View>
      <ScrollView scrollEnabled={true} style={styles.pageContainer}>
        {messages?.length > 0 ? messages.map((item) => (
          <View style={styles.itemContainer} key={item.category}>
            <BaseText style={{ fontSize: 20, fontWeight: "200" }}>{item.category.replace(/_/g, " ")}</BaseText>
            <BaseText style={{ fontSize: 24, color: colors.tertiary }}>{item.scoreValue}</BaseText>
            <MarkdownScreen>{item.message}</MarkdownScreen>
          </View>
        )) : <></>}
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
});

const mapDispatchToProps = {
  setActivities,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ActivitySummary);
