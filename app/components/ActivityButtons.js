import React, { useState } from "react";
import PropTypes from "prop-types";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import ScreenButton from "./screen/ScreenButton";
import { colors } from "../themes/colors";
import Svg, { Rect, Mask, Circle, Defs } from "react-native-svg";

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

const renderTimer = (timerActive, onSwitchTimer) => {
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
          !timerActive ? {
            paddingLeft: 20,
            paddingRight: 15,
          } : { justifyContent: 'center', paddingHorizontal: 23 }
        ]}
      >
        {
          !timerActive &&
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
              onPress={onSwitchTimer}
            /> ||
          <TouchableOpacity onPress={onSwitchTimer} style={{ flexDirection: 'row' }}>
            <View style={{ width: 10, backgroundColor: colors.primary, height: 32, marginRight: 6 }} />
            <View style={{ width: 10, backgroundColor: colors.primary, height: 32 }} />
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
  onPressPrev,
  onPressNext,
  onPressAction,
  timerActive,
  onSwitchTimer
}) => {
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  return (
    <View
      onLayout={(evt) => {
        const { width, height } = evt.nativeEvent.layout;
        setWidth(width)
        setHeight(height)
      }}
    >
      {
        timerActive !== undefined ?
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
          timerActive === undefined ?
            renderButton(prevLabel, prevEnabled, onPressPrev) :
            renderTimer(timerActive, onSwitchTimer, height)
        }
        {renderButton(actionLabel, true, onPressAction)}
        {renderButton(nextLabel, nextEnabled, onPressNext)}
      </View>
    </View>
  )
}

ActivityButtons.defaultProps = {
  timerActive: undefined,
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
  timerActive: PropTypes.bool,
  onPressPrev: PropTypes.func,
  onPressNext: PropTypes.func,
  onPressAction: PropTypes.func,
  onSwitchTimer: PropTypes.func,
};

export default ActivityButtons;
