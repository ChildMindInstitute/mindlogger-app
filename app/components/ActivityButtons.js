import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import ScreenButton from "./screen/ScreenButton";
import { colors } from "../themes/colors";
import Svg, { Rect, Mask, Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import TimerProgress from './TimerProgress';

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 5,
    backgroundColor: 'transparent',
  },
  shadowStyle: {
    shadowColor: 'grey',
    shadowRadius: 2,
    shadowOpacity: 0.2,
    shadowOffset: {
      width: -4,
      height: 0
    }
  }
});

export class ActivityButtons extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 0,
      height: 0
    }

    this.timeElapsed = props.timeLimit - props.timeLeft;
    this.timerId = 0;
  }

  startTimer() {
    const { timeLimit, timerActive } = this.props;
    let prevTime = Date.now() + 1000;

    const updateClock = () => {
      prevTime += 1000;

      this.timeElapsed += 1000;

      if (this.timeElapsed >= timeLimit && timeLimit) {
        this.switchTimer()
        this.timerId = 0
      } else {
        this.props.setTimerStatus(timerActive, timeLimit - this.timeElapsed)
        this.timerId = setTimeout(updateClock, prevTime - Date.now())
      }
    }

    this.timerId = setTimeout(updateClock, 1000)
  }

  stopTimer() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = 0;
    }
  }

  componentDidUpdate(oldProps) {
    const { timerActive, appStatus, timeLimit, timeLeft, lastAvailableTime } = this.props;

    if (timerActive) {
      // app goes background
      if (!appStatus && oldProps.appStatus) {
        this.saveLastActiveTime();
        this.stopTimer();

        return ;
      }

      // app goes active
      if (appStatus && (!oldProps.appStatus || !oldProps.timerActive) && lastAvailableTime) {
        this.timeElapsed = timeLimit - timeLeft + Date.now() - lastAvailableTime;

        this.props.setTimerStatus(!timeLimit || this.timeElapsed < timeLimit, timeLimit - this.timeElapsed);
      }

      if (appStatus && !this.timerId) {
        this.startTimer();
      }
    }

    if (!(timerActive && appStatus) && this.timerId) {
      this.stopTimer();
    }
  }

  componentDidMount() {
    const { timerActive, timeLimit, timeLeft, lastAvailableTime } = this.props;

    if (timerActive) {
      if (lastAvailableTime) {
        this.timeElapsed = timeLimit - timeLeft + Date.now() - lastAvailableTime;
        this.props.setTimerStatus(!timeLimit || this.timeElapsed < timeLimit, timeLimit - this.timeElapsed);
      }

      this.startTimer();
    }
  }

  saveLastActiveTime() {
    if (this.props.timerActive) {
      this.props.setTimerStatus(
        this.props.timerActive,
        this.props.timeLimit - this.timeElapsed,
        Date.now()
      )
    }
  }

  componentWillUnmount() {
    this.saveLastActiveTime();
    this.stopTimer();
  }

  switchTimer() {
    this.props.setTimerStatus(!this.props.timerActive, this.props.timeLimit - this.timeElapsed)
  }

  renderButton(label, enabled, onPress) {
    const handlePress = (label, onPress) => {
      onPress();
    };

    if (!enabled || !label) {
      return <ScreenButton transparent />;
    }
    return (
      <ScreenButton
        transparent
        onPress={() => handlePress(label, onPress)}
        text={label}
      />
    );
  };

  renderTimer(timerActive, timerFinished) {
    const renderActionButton = (timerFinished) => {
      return (
        <Svg width={10} height={32}>
          <Defs>
            <RadialGradient id="grad" cx={5} cy={16} rx={10} ry={32} gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor="white" stopOpacity="1" />
              <Stop offset="1" stopColor="#DDDDDD" stopOpacity="1" />
            </RadialGradient>
          </Defs>

          <Rect x={0} y={0} width={10} height={32} fill={timerFinished ? "url(#grad)" : colors.primary} />
        </Svg>
      )
    };

    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <View
          style={[
            {
              backgroundColor: 'white',
              borderRadius: 24,
              paddingVertical: 10
            },
            !timerActive && !timerFinished ? {
              paddingLeft: 20,
              paddingRight: 15,
            } : { justifyContent: 'center', paddingHorizontal: 23 }
          ]}
        >
          {
            !timerActive && !timerFinished &&
              <TouchableOpacity
                style={{
                  borderTopWidth: 16,
                  borderBottomWidth: 16,
                  borderTopColor: 'transparent', borderBottomColor: 'transparent',
                  borderLeftWidth: 32,
                  borderLeftColor: colors.yellow,
                  borderStyle: 'solid',
                  width: 0, height: 0
                }}
                onPress={() => this.switchTimer()}
              /> ||
            <TouchableOpacity onPress={() => this.switchTimer()} style={{ flexDirection: 'row' }} disabled={timerFinished}>
              { renderActionButton(timerFinished) }
              <View style={{ width: 6 }} />
              { renderActionButton(timerFinished) }
            </TouchableOpacity>
          }
        </View>
      </View>
    )
  }


  render() {
    const {
      nextLabel, nextEnabled, prevLabel, prevEnabled,
      actionLabel, onPressPrev, onPressNext, onPressAction, timerEnabled,
      timeLimit, timerActive, timeLeft
    } = this.props;
    const { width, height } = this.state;

    const timerFinished = timeLeft <= 0 && timeLimit != 0;
    this.timeElapsed = timeLimit - timeLeft;

    return (
      <View>
        {
          timerEnabled ?
            <TimerProgress
              current={this.timeElapsed / 1000}
              length={timeLimit / 1000}
              color={(timerActive || timerFinished) ? colors.primary : colors.yellow}
              sliderColor={(timerActive || timerFinished) ? colors.primary : colors.yellow}
            /> : <></>
        }
        <View
          onLayout={(evt) => {
            const { width, height } = evt.nativeEvent.layout;
            this.setState({ width, height })
          }}
        >
          {
            timerEnabled ?
              <View
                style={{ position: 'absolute', backgroundColor: colors.lightBlue, width: '100%', height: '100%' }}
              >
                <View style={styles.shadowStyle}>
                  <Svg width={width} height={height}>
                    <Defs>
                      <Mask id="background">
                        <Rect x={width/3 - height/3} y={height*2/3} width={height/3} height={height/3} fill="white"/>
                        <Circle x={width/3 - height/3} y={height*2/3} r={height/3} fill="black" />
                      </Mask>
                    </Defs>

                    <Rect x={0} y={0} width={width} height={height} fill="white" mask="url(#background)" />
                  </Svg>

                  <View
                    style={{
                      position: 'absolute',
                      backgroundColor: 'white',
                      width: width*2/3,
                      height,
                      right: 0,
                      borderTopLeftRadius: height/2
                    }}
                  />
                </View>
              </View>
            : <></>
          }

          <View style={styles.footer}>
            {
              !timerEnabled ?
                this.renderButton(prevLabel, prevEnabled, onPressPrev) :
                this.renderTimer(timerActive, timerFinished)
            }
            {this.renderButton(actionLabel, true, onPressAction)}
            {this.renderButton(nextLabel, nextEnabled, () => {
              if (timerActive) {
                this.switchTimer();
              }

              onPressNext()
            })}
          </View>
        </View>
      </View>
    )
  }
}

ActivityButtons.defaultProps = {
  timerEnabled: undefined,
  timeLimit: 0,
  timeLeft: 0,
  nextLabel: undefined,
  nextEnabled: true,
  prevLabel: undefined,
  prevEnabled: true,
  actionLabel: undefined,
  onPressPrev: undefined,
  onPressNext: undefined,
  onPressAction: undefined,
};

ActivityButtons.propTypes = {
  nextLabel: PropTypes.string,
  nextEnabled: PropTypes.bool,
  prevLabel: PropTypes.string,
  prevEnabled: PropTypes.bool,
  actionLabel: PropTypes.string,
  timerEnabled: PropTypes.bool,
  timerActive: PropTypes.bool,
  timeLimit: PropTypes.number,
  timeLeft: PropTypes.number,
  appStatus: PropTypes.bool,
  onPressPrev: PropTypes.func,
  onPressNext: PropTypes.func,
  onPressAction: PropTypes.func,
  setTimerStatus: PropTypes.func,
};

export default ActivityButtons;
