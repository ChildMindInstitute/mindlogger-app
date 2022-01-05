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

const renderButton = (label, enabled, onPress) => {
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

const renderTimer = (timerActive, timerDisabled, switchTimer) => {
  const renderActionButton = (timerDisabled) => {
    return (
      <Svg width={10} height={32}>
        <Defs>
          <RadialGradient id="grad" cx={5} cy={16} rx={10} ry={32} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="white" stopOpacity="1" />
            <Stop offset="1" stopColor="#DDDDDD" stopOpacity="1" />
          </RadialGradient>
        </Defs>

        <Rect x={0} y={0} width={10} height={32} fill={timerDisabled ? "url(#grad)" : colors.primary} />
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
          !timerActive && !timerDisabled ? {
            paddingLeft: 20,
            paddingRight: 15,
          } : { justifyContent: 'center', paddingHorizontal: 23 }
        ]}
      >
        {
          !timerActive && !timerDisabled &&
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
              onPress={switchTimer}
            /> ||
          <TouchableOpacity onPress={switchTimer} style={{ flexDirection: 'row' }} disabled={timerDisabled}>
            { renderActionButton(timerDisabled) }
            <View style={{ width: 6 }} />
            { renderActionButton(timerDisabled) }
          </TouchableOpacity>
        }
      </View>
    </View>
  )
}

const ActivityButtons = ({
  nextLabel,
  nextEnabled,
  prevLabel,
  prevEnabled,
  actionLabel,
  actionEnabled,
  onPressPrev,
  onPressNext,
  onPressAction,
  timerEnabled,
  timeLimit,
  timeLeft,
  appStatus,
  timerActive,
  setTimerStatus
}) => {
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const timeElapsed = useRef(timeLimit - timeLeft);

  const switchTimer = () => {
    setTimerStatus(!timerActive, timeLimit - timeElapsed.current)
  }

  useEffect(() => {
    timeElapsed.current = timeLimit - timeLeft
  }, [timeLeft])

  useEffect(() => {
    let timerId = 0;

    if (timerActive && appStatus) {
      let prevTime = Date.now() + 1000;

      const updateClock = () => {
        prevTime += 1000;

        timeElapsed.current += 1000;

        if (timeElapsed.current >= timeLimit && timeLimit) {
          switchTimer()
          timerId = 0
        } else {
          setTimerStatus(timerActive, timeLimit - timeElapsed.current)
          timerId = setTimeout(updateClock, prevTime - Date.now())
        }
      }

      timerId = setTimeout(updateClock, 1000)
    }

    return () => {
      if (timerId) {
        clearTimeout(timerId)
      }
    }
  }, [timerActive, appStatus])

  const timerDisabled = timeElapsed.current >= timeLimit && timeLimit;

  return (
    <View>
      {
        timerEnabled ?
          <TimerProgress
            current={timeElapsed.current / 1000}
            length={timeLimit / 1000}
            color={(timerActive.current || timerDisabled) ? colors.primary : colors.yellow}
            sliderColor={(timerActive.current || timerDisabled) ? colors.primary : colors.yellow}
          /> : <></>
      }
      <View
        onLayout={(evt) => {
          const { width, height } = evt.nativeEvent.layout;
          setWidth(width)
          setHeight(height)
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
              renderButton(prevLabel, prevEnabled, onPressPrev) :
              renderTimer(timerActive.current, timerDisabled, switchTimer)
          }
          {renderButton(actionLabel, true, onPressAction)}
          {renderButton(nextLabel, nextEnabled, () => {
            if (timerActive) {
              switchTimer();
            }

            onPressNext()
          })}
        </View>
      </View>
    </View>
  )
}

ActivityButtons.defaultProps = {
  timerEnabled: undefined,
  timeLimit: 0,
  timeLeft: -1,
  nextLabel: undefined,
  nextEnabled: true,
  prevLabel: undefined,
  prevEnabled: true,
  actionLabel: undefined,
  actionEnabled: true,
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
  actionEnabled: PropTypes.bool,
  onPressPrev: PropTypes.func,
  onPressNext: PropTypes.func,
  onPressAction: PropTypes.func,
  setTimerStatus: PropTypes.func,
};

export default ActivityButtons;
