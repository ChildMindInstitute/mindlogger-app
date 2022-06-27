import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { ImageBackground, View, StyleSheet } from "react-native";
import { Actions } from "react-native-router-flux";
import i18n from "i18next";
import { BodyText, Heading } from "../../components/core";
import theme from "../../themes/base-theme";
import FunButton from "../../components/core/FunButton";
import { isTokenLoggerApplet } from '../../services/tokens';
import {
  currentAppletSelector,
} from "../../state/app/app.selectors";
import { currentResponsesSelector } from "../../state/responses/responses.selectors";
import TokenLoggerBackground from '../../../img/tokenlogger_background.png'

const styles = StyleSheet.create({
  box: {
    padding: 20,
    paddingTop: 40,
    flex: 1,
    justifyContent: "center",
    // backgroundColor: 'white',
    fontFamily: theme.fontFamily,
  },
});

const ActivityThanks = ({ currentApplet, currentResponses }) => {
  const tokenLogger = isTokenLoggerApplet(currentApplet);
  const onClose = () => {
    Actions.replace("applet_details");
  };

  return (
    <ImageBackground
      style={{ width: "100%", height: "100%", flex: 1 }}
      source={
        tokenLogger ? TokenLoggerBackground : {
          uri: "https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80",
        }
      }
    >
      <View style={styles.box}>
        {
          currentResponses &&
            <BodyText style={{ fontFamily: theme.fontFamily, textAlign: "center", fontWeight: '500', fontSize: 22 }}>
              Please Wait ...
            </BodyText>
          ||
            <>
              <Heading style={{ fontFamily: theme.fontFamily, textAlign: "center" }}>
                {i18n.t("additional:thanks")}
              </Heading>
              <BodyText style={{ fontFamily: theme.fontFamily, textAlign: "center" }}>
                {i18n.t("additional:saved_answers")}
              </BodyText>

              <FunButton onPress={onClose}>{i18n.t("additional:close")}</FunButton>
            </>
        }
      </View>
    </ImageBackground>
  );
};

ActivityThanks.propTypes = {};

const mapStateToProps = (state) => ({
  currentApplet: currentAppletSelector(state),
  currentResponses: currentResponsesSelector(state)
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ActivityThanks);
