import React, { Component } from "react";
import {
  Dimensions,
  StyleSheet,
  ScrollView,
  View,
  Platform,
  KeyboardAvoidingView,
  Keyboard
} from "react-native";
import { connect } from "react-redux";

import PropTypes from "prop-types";
import { Icon, Button } from "native-base";
import ScreenDisplay from "./ScreenDisplay";
import Widget from "./Widget";
import Timer from "../Timer";
import { colors } from "../../theme";

import {
  itemStartTimeSelector,
} from "../../state/responses/responses.selectors";

const styles = StyleSheet.create({
  outer: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    position: "relative",
  },
  keyboardContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  contentContainer: {
    padding: 20,
    paddingTop: 25,
    minHeight: "100%",
    justifyContent: "center",
    flexGrow: 1,
  },
  text: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  delayView: {
    position: "relative",
    minHeight: 100,
  },
  timerView: {
    position: "absolute",
    right: 20,
    top: 100,
  },
  delayTimerView: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.5,
  },
  button: {
    width: 60,
    height: 60,
    padding: 0,
    backgroundColor: colors.secondary,
    borderWidth: 1.5,
    borderRadius: 35,
    borderColor: colors.primary,
  },
  icon: {
    color: colors.primary,
    fontSize: 17,
    padding: 0,
    margin: 0,
  },
});

const { height } = Dimensions.get("window");

class ActivityScreen extends Component {
  static isValid(answer, screen) {
    if (screen.inputType === "markdownMessage" || screen.inputType === "audioStimulus") {
      return true;
    }

    if (screen.valueConstraints && screen.valueConstraints.isOptionalTextRequired) {
      if (!answer || !answer["text"]) {
        return false;
      }
    }

    if (screen.inputType === "text" || screen.inputType === "time" || screen.inputType === "audioImageRecord") {
      if (!answer) {
        return false;
      } else {
        return true;
      }
    }

    if (screen.inputType === 'stackedRadio' || screen.inputType === 'stackedSlider') {
      if (!answer) {
        return false;
      }
      for (let i = 0; i < answer.length; i++) {
        if (answer[i] !== null) {
          return true;
        }
      }

      return false;
    }

    if (answer !== null && typeof answer !== "undefined") {
      if (screen.valueConstraints.isOptionalTextRequired && (typeof answer["text"] === "undefined" || answer["text"] == "")) {
        return false
      }
    }

    if (screen.inputType === "slider" || (screen.inputType === "radio" && !screen.valueConstraints.multipleChoice)) {
      if (!answer || (answer.value !== 0 && !answer.value)) {
        return false;
      }
    }

    if (screen.inputType === "radio" && screen.valueConstraints.multipleChoice) {
      if (!answer || !answer.value || !answer.value.length) {
        return false;
      }
    }

    if (screen.inputType === 'stackedRadio' || screen.inputType === 'stackedSlider') {
      if (!answer) {
        return false;
      }
      for (let i = 0; i < answer.length; i++) {
        if (!Array.isArray(answer[i]) && answer[i] !== null || Array.isArray(answer[i]) && answer[i].length > 0) {
          return true;
        }
      }

      return false;
    }

    if (answer !== null && typeof answer !== "undefined") {
      if (Array.isArray(answer["value"])) {
        return answer["value"].length !== 0;
      }
      if (Array.isArray(answer)) {
        if (Array.isArray(answer[0])) {
          return answer[0].length;
        }
        return answer.length !== 0;
      }
    }

    return answer && (answer.value === 0 || !!answer.value);
  }

  constructor() {
    super();
    this.state = {
      scrollEnabled: true,
      inputDelayed: false,
      timerActive: false,
      screenHeight: 0,
    };
    this.interval = null;
    this.startTime = null;
    this.scrollToBottom = this.scrollToBottom.bind(this);
    this.keyboardWillHide = this.keyboardWillHide.bind(this);
    this.keyboardWillShow = this.keyboardWillShow.bind(this);
    this.keyboardVisible = false;
  }

  componentDidMount() {
    const { isCurrent } = this.props;
    if (isCurrent) {
      this._startClock();
    }

    if (Platform.OS === "ios") {
      Keyboard.addListener('keyboardDidShow', this.scrollToBottom)
      Keyboard.addListener('keyboardWillHide', this.keyboardWillHide)
      Keyboard.addListener('keyboardWillShow', this.keyboardWillShow)
    }
  }

  keyboardWillHide() {
    this.keyboardVisible = false;
  }

  keyboardWillShow() {
    this.keyboardVisible = true;
  }

  scrollToBottom(obj) {
    if (this.scrollView) {
      this.scrollView.scrollToEnd();
    }
  }

  componentDidUpdate(oldProps, oldState) {
    const { isCurrent } = this.props;

    if (isCurrent && oldProps.isCurrent === false) {
      this._startClock();
    } else if (oldProps.isCurrent && isCurrent === false) {
      this._resetClock();
    }

    if (
      this.state.timerActive == true && oldState.timerActive == false
    ) {
      this._clockTick();
    }
  }

  componentWillUnmount() {
    if (Platform.OS === "ios") {
      Keyboard.removeListener('keyboardDidShow', this.scrollToBottom);
      Keyboard.removeListener('keyboardWillHide', this.keyboardWillHide)
      Keyboard.removeListener('keyboardWillShow', this.keyboardWillShow)
    }

    this._resetClock();
  }

  _startClock = () => {
    this.interval = setInterval(this._clockTick, 500);
    this.startTime = this.props.itemStartTime;

    if (this.props.screen.timer) {
      this.setState({ timerActive: true });
    }
  };

  _resetClock = () => {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.setState({
        scrollEnabled: true,
        inputDelayed: false,
        timerActive: false,
      });
    }
  };

  _clockTick = () => {
    const { onChange, screen, answer } = this.props;
    const { delay, timer } = screen;
    const { inputDelayed, timerActive } = this.state;
    const timeElapsed = Date.now() - this.startTime;

    // Set inputDelayed to true if we're in the delay period
    if (delay) {
      if (timeElapsed < delay && inputDelayed === false) {
        this.setState({ inputDelayed: true });
      } else if (timeElapsed >= delay && inputDelayed === true) {
        this.setState({ inputDelayed: false });
      }
    }

    // Advance to next if the timer has expired
    if (timer) {
      const safeDelay = delay || 0;
      const timerEnd = safeDelay + timer;

      if (timeElapsed >= timerEnd && timerActive) {
        this.setState({ timerActive: false });

        this._resetClock();
        onChange(answer, true, timeElapsed);
      }
    }
  };

  onContentSizeChange = (contentWidth, contentHeight) => {
    this.setState({ screenHeight: contentHeight });

    if (this.keyboardVisible && this.state.screenHeight < contentHeight) {
      this.scrollToBottom()
    }
  };

  isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - 1;
  };

  render() {
    const { screen, answer, onChange, isCurrent, onContentError } = this.props;
    const { scrollEnabled, inputDelayed, timerActive } = this.state;

    return (
      <View style={styles.outer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardContainer}
          enabled
          keyboardVerticalOffset={40}
        >
          <ScrollView
            alwaysBounceVertical={false}
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            scrollEnabled={scrollEnabled}
            // eslint-disable-next-line no-return-assign
            ref={(scrollView) => (this.scrollView = scrollView)}
            onContentSizeChange={this.onContentSizeChange}
            onScroll={({ nativeEvent }) => {
              if (this.isCloseToBottom(nativeEvent)) {
                this.setState({ screenHeight: height });
              }
            }}
          >
            <ScreenDisplay screen={screen} />
            {inputDelayed ? (
              <View pointerEvents="none" style={styles.delayView}>
                <View style={styles.delayTimerView}>
                  <Timer
                    duration={screen.delay}
                    color={colors.tertiary}
                    size={50}
                    strokeWidth={5}
                  />
                </View>
                <View style={{ opacity: 0.25 }}>
                  <Widget
                    answer={answer}
                    onChange={onChange}
                    isCurrent={isCurrent}
                    screen={screen}
                    onPress={() => {
                      this.setState({ scrollEnabled: false });
                    }}
                    onRelease={() => {
                      this.setState({ scrollEnabled: true });
                    }}
                  />
                </View>
              </View>
            ) : (
                <Widget
                  answer={answer}
                  onChange={onChange}
                  isCurrent={isCurrent}
                  screen={screen}
                  onPress={() => {
                    this.setState({ scrollEnabled: false });
                  }}
                  onRelease={() => {
                    this.setState({ scrollEnabled: true });
                  }}
                  onContentError={onContentError}
                />
              )}
          </ScrollView>
        </KeyboardAvoidingView>
        {timerActive && (
          <View style={styles.timerView}>
            <Timer duration={screen.timer} color={colors.primary} size={40} startTime={this.startTime} />
          </View>
        )}
        {this.state.screenHeight > height ? (
          <View
            style={{
              position: "absolute",
              bottom: 7,
              alignSelf: "center",
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.5,
              shadowRadius: 7.5,
              elevation: 4,
              flex: 1,
            }}
          >
            <Button
              onPress={() => {
                this.scrollView.scrollToEnd();
                this.setState({ screenHeight: height });
              }}
              style={styles.button}
            >
              <Icon
                type="FontAwesome"
                name="chevron-down"
                style={styles.icon}
              />
            </Button>
          </View>
        ) : null}
      </View>
    );
  }
}

ActivityScreen.defaultProps = {
  answer: undefined,
};

ActivityScreen.propTypes = {
  screen: PropTypes.object.isRequired,
  answer: PropTypes.any,
  activity: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  onContentError: PropTypes.func.isRequired,
  isCurrent: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  itemStartTime: itemStartTimeSelector(state),
});

export default connect(mapStateToProps)(ActivityScreen);
