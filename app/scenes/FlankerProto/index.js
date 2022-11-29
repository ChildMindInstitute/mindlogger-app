import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Container,
  Content,
  Button,
  Icon,
  View,
  Header,
  Right,
  Body,
  Title,
  Left,
} from "native-base";
import { colors } from "../../theme";
import BaseText from "../../components/base_text/base_text";
import { StatusBar, StyleSheet, TouchableOpacity } from "react-native";
import { isIOS } from "react-native-elements/src/helpers";
import { Actions } from "react-native-router-flux";
import { addScheduleNotificationDebugObjects } from "../../services/network";
import { UserInfoStorage } from "../../features/system";
import EncryptedStorage from "react-native-encrypted-storage";
import { getStringHashCode } from "../../utils/debug-utils";

const IOSHeaderPadding = isIOS ? 24 : 0;
const IOSBodyPadding = isIOS ? 9 : 0;

const Mode = {
  Stimulus: 1,
  Feedback: 2,
  Fixation: 3,
};

const StimulusInterval = 1500;

const FeedbackInterval = 500;

const FixationInterval = 1000;

const userInfoStorage = UserInfoStorage(EncryptedStorage);

const FlankerProto = () => {
  const [buttonPressed, setButtonPressed] = useState(false);

  const [currentTextValue, setCurrentTextValue] = useState("Ready?");

  const [feedback, setFeedback] = useState(false);

  const [currentMode, setCurrentMode] = useState(Mode.Stimulus);

  const textValues = useMemo(
    () => ["<<<<>", "<<><<", "><><>", "<><><", ">>>><"],
    []
  );

  const valueIndexRef = useRef(0);

  const stimulusTimeoutRef = useRef(null);

  const lastTime = useRef(new Date().getTime());

  const logsRef = useRef([]);

  useEffect(() => {
    runStimulus();
    return () => clearInterval(stimulusTimeoutRef.current);
  }, []);

  const runStimulus = () => {
    setStimulus();

    stimulusTimeoutRef.current = setInterval(() => {
      setStimulus();
    }, StimulusInterval);
  };

  const setStimulus = () => {
    valueIndexRef.current++;

    const now = getNow();

    const log =
      "Flanker: stimulus start: " +
      numberWithSpacesAndDiff(now, lastTime.current);
    console.log(log);
    logsRef.current.push(log);

    lastTime.current = now;

    const value = textValues[valueIndexRef.current % textValues.length];
    setCurrentTextValue(value);
  };

  const onClickHome = async () => {
    Actions.pop();
    const { fcmToken, email } = await userInfoStorage.get();

    addScheduleNotificationDebugObjects({
      actionType: "FlankerImagesProto",
      deviceId: getStringHashCode(fcmToken).toString() + "_ftxt",
      notificationDescriptions: logsRef.current.length
        ? { flankerLogs: logsRef.current }
        : [{}],
      notificationsInQueue: [{}],
      scheduledNotifications: [{}],
      flankerLogs: logsRef.current.length ? logsRef.current : [{}],
      userId: email,
    });
  };

  const onTapDown = () => {
    if (currentMode !== Mode.Stimulus) {
      return;
    }

    const now = getNow();

    const log =
      "Flanker: tap down: " + numberWithSpacesAndDiff(now, lastTime.current);
    console.log(log);
    logsRef.current.push(log);

    lastTime.current = now;

    clearInterval(stimulusTimeoutRef.current);
    stimulusTimeoutRef.current = null;

    setButtonPressed(true);
    setCurrentMode(Mode.Feedback);
    setFeedback((x) => !x);

    setTimeout(() => {
      setFixation();
    }, FeedbackInterval);
  };

  const setFixation = () => {
    const now = getNow();

    const log =
      "Flanker: fixation start: " +
      numberWithSpacesAndDiff(now, lastTime.current);
    console.log(log);
    logsRef.current.push(log);

    lastTime.current = now;

    setCurrentMode(Mode.Fixation);
    setTimeout(() => {
      setCurrentMode(Mode.Stimulus);
      runStimulus();
    }, FixationInterval);
  };

  const onTapUp = () => {
    setButtonPressed(false);
  };

  const numberWithSpaces = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const numberWithSpacesAndDiff = (x, l) => {
    return (
      valueIndexRef.current +
      " : " +
      numberWithSpaces(x) +
      "          |   " +
      (x - l).toString()
    );
  };

  const getNow = () => {
    return new Date().getTime();
  };

  return (
    <Container style={styles.container}>
      <StatusBar barStyle={isIOS ? "dark-content" : "light-content"} />
      <Header
        style={{ backgroundColor: "darkgrey", paddingTop: IOSHeaderPadding }}
      >
        <Left>
          <Button transparent onPress={onClickHome}>
            <Icon style={styles.home} ios="ios-home" android="md-home" />
          </Button>
        </Left>
        <Body style={{ paddingTop: IOSBodyPadding }}>
          <Title>About</Title>
        </Body>
        <Right>
          <Button transparent>
            <Icon type="FontAwesome" name="bars" />
          </Button>
        </Right>
      </Header>
      <Content style={styles.content}>
        <View style={styles.stimulusWrapper}>
          {currentMode === Mode.Stimulus && (
            <BaseText style={styles.stimulusText}>{currentTextValue}</BaseText>
          )}
          {currentMode === Mode.Feedback && (
            <BaseText
              style={[
                styles.feedbackText,
                feedback && styles.feedbackTextCorrect,
              ]}
            >
              {feedback === false ? "Incorrect" : "Correct"}
            </BaseText>
          )}
          {currentMode === Mode.Fixation && (
            <BaseText style={styles.fixationText}>{"Fixation"}</BaseText>
          )}
        </View>
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={onTapDown}
            onPressOut={onTapUp}
          >
            <View
              style={[
                styles.buttonRect,
                buttonPressed && styles.buttonPressedRect,
              ]}
            >
              <BaseText style={styles.buttonText}>
                {valueIndexRef.current + " : "} Press Here
              </BaseText>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.timerWrapper}>
          <BaseText style={styles.timerText}>
            {numberWithSpaces(new Date().getTime())}
          </BaseText>
        </View>
      </Content>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.lightGrey,
  },
  content: {
    padding: 16,
  },
  stimulusWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 300,
  },
  stimulusText: {
    fontSize: 66,
    fontWeight: "700",
  },
  feedbackText: {
    fontSize: 66,
    fontWeight: "700",
    color: "red",
  },
  feedbackTextCorrect: {
    color: "green",
  },
  fixationText: {
    fontSize: 66,
    fontWeight: "700",
    color: "blue",
  },
  buttonWrapper: {
    marginTop: 104,
  },
  buttonRect: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: colors.blue,
    padding: 12,
  },
  buttonPressedRect: {
    backgroundColor: "yellow",
  },
  buttonText: {
    color: "white",
    fontSize: 30,
    fontWeight: "600",
  },
  timerWrapper: {
    marginTop: 26,
    flex: 1,
    alignItems: "center",
  },
  timerText: {
    fontSize: 16,
  },
});

export default FlankerProto;
