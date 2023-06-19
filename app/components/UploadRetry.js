import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { syncUploadQueue } from "../state/app/app.thunks";
import {
  isUploadInProgressSelector,
  uploadQueueSelector,
} from "../state/responses/responses.selectors";
import _ from "lodash";
import { colors } from "../theme";
import { ActivityIndicator } from "react-native";
import BaseText from "./base_text/base_text";

const UploadRetry = ({ queue, syncUploadQueue, isInProgress }) => {
  if (!queue?.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.textWrapper}>
          <BaseText
            style={styles.text}
            textKey="network_alerts:data_not_sent"
          />
        </View>
        <View>
          {isInProgress ? (
            <View style={{ flex: 1, justifyContent: "center" }}>
              <ActivityIndicator color={"black"} style={styles.spinner} />
            </View>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() => syncUploadQueue()}
            >
              <BaseText style={styles.buttonText} textKey="Retry" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 50,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "grey",
    backgroundColor: colors.alertLight,
  },
  innerContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  textWrapper: {
    justifyContent: "center",
    maxWidth: 310,
  },
  text: {
    textAlignVertical: "center",
    fontSize: 15,
  },
  spinner: {
    marginRight: 10,
  },
  button: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

UploadRetry.propTypes = {};

const mapStateToProps = (state) => ({
  queue: uploadQueueSelector(state),
  isInProgress: isUploadInProgressSelector(state),
});

const mapDispatchToProps = (dispatch) => {
  return {
    syncUploadQueue: () => {
      dispatch(syncUploadQueue());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UploadRetry);
