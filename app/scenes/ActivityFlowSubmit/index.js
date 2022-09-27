import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { ImageBackground, Image, View, StyleSheet, ActivityIndicator } from "react-native";
import { Actions } from "react-native-router-flux";
import i18n from "i18next";
import { BodyText } from "../../components/core";
import { Button, Text } from 'native-base';
import theme from "../../themes/base-theme";
import { colors } from '../../theme';
import { isTokenLoggerApplet } from '../../services/tokens';
import {
  currentAppletSelector,
} from "../../state/app/app.selectors";
import { currentResponsesSelector } from "../../state/responses/responses.selectors";
import { nextActivity } from "../../state/responses/responses.thunks";
import TokenLoggerBackground from '../../../img/tokenlogger_background.png'

const badge = require('../../../img/badge.png');
const styles = StyleSheet.create({
  box: {
    paddingTop: 40,
    paddingHorizontal: 40,
    flex: 1,
    justifyContent: "center",
    // backgroundColor: 'white',
    fontFamily: theme.fontFamily,
  },
  nextActivity: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 25,
    borderRadius: 16,
    fontFamily: theme.fontFamily,
    alignItems: 'center',
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.grey,
  }
});
let activityFlow = {}, index = 0;

const ActivityFlowSubmit = ({ currentApplet, currentResponses, orderIndex, nextActivity }) => {
  const tokenLogger = isTokenLoggerApplet(currentApplet);
  const [isClicked, setIsClicked] = useState();

  if (currentResponses && currentResponses.activity && !currentResponses.activity.hasOwnProperty('allowExport')) {
    activityFlow = currentResponses && currentResponses.activity;
    index = activityFlow && orderIndex[activityFlow.id] || 0;

    const currentAct = currentApplet.activities.find(({ name }) => name.en === activityFlow.order[index])
    activityFlow.backDisabled = currentAct.backDisabled;
  }

  const onSubmit = () => {
    setIsClicked((prev) => {
      if (!prev) nextActivity(true);
      return true;
    })
  };

  const onBack = () => {
    nextActivity();
  }

  return (
    <ImageBackground
      style={{ width: "100%", height: "100%", flex: 1 }}
      source={
        tokenLogger ? TokenLoggerBackground : ""
      }
    >
      <View style={styles.box}>
        {
          !currentResponses &&
          <BodyText style={{ fontFamily: theme.fontFamily, textAlign: "center", fontWeight: '500', fontSize: 22 }}>
            Please Wait ...
          </BodyText>
          ||
          <>
            <BodyText style={{ fontFamily: theme.fontFamily, textAlign: "center" }}>
              {i18n.t("additional:submit_flow_answers")} <Text style={{fontWeight: 'bold'}}>{i18n.t("additional:submit")}</Text> {i18n.t("additional:submit_flow_answers_ex")}
            </BodyText>

            <View style={styles.nextActivity}>
              <Text style={{ fontWeight: "bold", marginBottom: 10 }}>{activityFlow?.order[index + 1]}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Image
                  source={badge}
                  style={{
                    width: 18,
                    height: 18,
                    opacity: 0.6,
                    right: 4,
                  }}
                />
                <Text style={{ fontSize: 14, color: colors.grey }}>
                  {`(${index + 2} of ${activityFlow.order?.length}) ${activityFlow.name}`}
                </Text>
              </View>
            </View>

            <Button
              full
              rounded
              onPress={onSubmit}
              style={{ marginTop: 25 }}
            >
              {!isClicked && (
                <Text
                  style={{ fontFamily: theme.fontFamily, fontSize: 17, fontWeight: "bold" }}
                >
                  {i18n.t("change_study:submit")}
                </Text>
              )}

              {isClicked && (
                <ActivityIndicator color={colors.lightGrey} />
              )}

            </Button>
            {!activityFlow.backDisabled && <Button
                full
                transparent
                onPress={onBack} style={{ marginTop: 10 }}
              >
                <Text
                  style={{ fontFamily: theme.fontFamily, fontSize: 17, fontWeight: "bold" }}
                >
                  {i18n.t("activity_navigation:back")}
                </Text>
              </Button>
            }
          </>
        }
      </View>
    </ImageBackground>
  );
};

ActivityFlowSubmit.propTypes = {};

const mapStateToProps = (state) => ({
  currentApplet: currentAppletSelector(state),
  currentResponses: currentResponsesSelector(state),
  orderIndex: state.activities.orderIndex,
});

const mapDispatchToProps = {
  nextActivity
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ActivityFlowSubmit);
