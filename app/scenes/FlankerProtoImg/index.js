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
import { Image, StatusBar, StyleSheet, TouchableOpacity } from "react-native";
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

const FlankerProtoImg = () => {
  const img8kUrl =
    "https://wallup.net/wp-content/uploads/2018/03/23/569390-coast-sea-stones-nature.jpg";

  const imgUrlValues = useMemo(() => [
    {
      url:
        "https://cdn.pixabay.com/photo/2015/12/01/20/28/road-1072821_1280.jpg",
      size: { w: 1280, h: 853 },
    },
    {
      url:
        "https://img.freepik.com/free-photo/odenwald-germany-is-pure-nature_181624-32381.jpg?w=2000&t=st=1669809071~exp=1669809671~hmac=19e55c25a66f551383c1d513c96125f522ad300025046530410d7de6bc7beac2",
      size: { w: 2000, h: 1381 },
    },
    {
      url:
        "https://thumbs.dreamstime.com/z/autumn-fall-nature-scene-autumnal-park-beautiful-77869343.jpg",
      size: { w: 1300, h: 958 },
    },
  ]);

  const [buttonPressed, setButtonPressed] = useState(false);

  const [currentImageValue, setCurrentImageValue] = useState(null);

  const [feedback, setFeedback] = useState(false);

  const [currentMode, setCurrentMode] = useState(Mode.Stimulus);

  const [imagesPrefetched, setImagesPrefetched] = useState(false);

  const [index, setIndex] = useState(0);

  const stimulusTimeoutRef = useRef(null);

  const valueIndexRef = useRef(0);

  const lastTimeRef = useRef(new Date().getTime());

  const logsRef = useRef([]);

  useEffect(() => {
    const promises = [];

    for (let imgUrl of imgUrlValues) {
      promises.push(Image.prefetch(imgUrl.url));
    }

    Promise.all(promises).then(() => {
      setImagesPrefetched(true);
    });

    return () => clearInterval(stimulusTimeoutRef.current);
  }, []);

  useEffect(() => {
    if (!imagesPrefetched) {
      return;
    }
    runStimulus();
  }, [imagesPrefetched]);

  const runStimulus = () => {
    setStimulus();
  };

  const setStimulus = () => {
    valueIndexRef.current++;
    const value = imgUrlValues[valueIndexRef.current % imgUrlValues.length];
    setCurrentImageValue(value);

    const now = getNow();
    const log =
      "Flanker: setStimulus: " +
      numberWithSpacesAndDiff(now, lastTimeRef.current);
    console.log(log);
    logsRef.current.push(log);

    lastTimeRef.current = now;
  };

  const onClickHome = async () => {
    Actions.pop();
    const { fcmToken, email } = await userInfoStorage.get();

    addScheduleNotificationDebugObjects({
      actionType: "FlankerImagesProto",
      deviceId: getStringHashCode(fcmToken).toString() + "_fimg",
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
      "Flanker: tap down: " + numberWithSpacesAndDiff(now, lastTimeRef.current);
    console.log(log);
    logsRef.current.push(log);

    lastTimeRef.current = now;

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
      numberWithSpacesAndDiff(now, lastTimeRef.current);
    console.log(log);
    logsRef.current.push(log);

    lastTimeRef.current = now;

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

  const onImageLoaded = () => {
    const now = getNow();

    const log =
      "Flanker: stimulus loaded: " +
      numberWithSpacesAndDiff(now, lastTimeRef.current);
    console.log(log);
    logsRef.current.push(log);

    lastTimeRef.current = now;

    setIndex((x) => x + 1);

    stimulusTimeoutRef.current = setTimeout(() => {
      setStimulus();
    }, StimulusInterval);
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
            <View style={{ width: 400, height: 300, marginTop: 100 }}>
              {imagesPrefetched && !!currentImageValue ? (
                <Image
                  style={
                    styles.tinyLogo && {
                      aspectRatio:
                        currentImageValue.size.w / currentImageValue.size.h,
                    }
                  }
                  source={{ uri: currentImageValue.url }}
                  onLoad={(params) => onImageLoaded(params)}
                />
              ) : (
                <BaseText
                  style={{ fontSize: 24, textAlign: "center", marginTop: 100 }}
                >
                  Loading...
                </BaseText>
              )}
            </View>
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
                {index + " : "} Press Here
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
    backgroundColor: colors.darkBlue,
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
  tinyLogo: {
    width: 400,
  },
});

export default FlankerProtoImg;
