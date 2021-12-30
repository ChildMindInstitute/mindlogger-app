import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { CachedImage } from 'react-native-img-cache';
import Svg, { Rect, Defs, Mask, LinearGradient, Stop, Circle, G } from 'react-native-svg'
import { Icon } from 'native-base';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 5
  },
  timesText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 29,
    color: 'white'
  },
  name: {
    width: '100%',
    flexShrink: 1,
    paddingLeft: 10,
  }
})

export const BehaviorCard = (props) => {
  const {
    ready, name, times, image, behaviorType, onPress, onLongPress, onTimesMenu
  } = props;

  const timeListItems = [0, 1, 2];
  const behaviorColor = behaviorType == 'positive' ? '#20609D' : '#50256F';

  const [width, setWidth] = useState(0);
  const [grantTime, setGrantTime] = useState(0);
  const height = 100;
  const imageDim = { width: 70, height: 70 }, padding = { x: 15, y: 15 };
  const timesStyle = { width: 100, height: 100 };
  const timeListIcon = { width: 90, height: 90 }
  const shadowColor = 'grey', shadowOpacity=0.5;
  const contentWidth = width ? width - timeListIcon.width + 5 : 0;

  const imageStyle = {
    top: padding.y,
    left: padding.x,
    width: imageDim.width,
    height: imageDim.height,
    borderRadius: imageDim.width/2,
  }
  return (
    <View
      style={styles.container}
      onLayout={(evt) => {
        const { width } = evt.nativeEvent.layout;
        setWidth(width)
      }}
      onStartShouldSetResponder={() => true}
      onResponderGrant={() => {
        setGrantTime(new Date().getTime());
      }}
      onResponderRelease={() => {
        const interval = new Date().getTime() - grantTime;
        if (interval > 400) {
          onLongPress();
        } else {
          onPress();
        }
        setGrantTime(0);
      }}
    >
      <Svg width={'100%'} height={height+2}>
        <Defs>
          <LinearGradient id="leftShadowGradient" x1="0%" x2="100%" y1="0%" y2="0%">
            <Stop offset="0" stopColor={shadowColor} stopOpacity={shadowOpacity} key='0' />
            <Stop offset="0.5" stopColor={shadowColor} stopOpacity={0} key='1' />
          </LinearGradient>

          <Mask id="leftShadowMask">
            <Rect x={0} y={0} width={50} height={height+5} fill="white" rx={20} />
            <Rect x={10} y={0} width={50} height={height+5} fill="black" rx={20} />
          </Mask>

          <LinearGradient id="bottomShadowGradient" x1="0%" x2="0%" y1="0%" y2="100%">
            <Stop offset="0" stopColor={shadowColor} stopOpacity={0} key='0' />
            <Stop offset="0.5" stopColor={shadowColor} stopOpacity={shadowOpacity} key='1' />
            <Stop offset="1" stopColor={shadowColor} stopOpacity={0} key='2' />
          </LinearGradient>

          <Mask id="bottomShadowMask">
            <Rect x={0} y={0} width={contentWidth} height={height-5} rx={20} fill="black"></Rect>
            <Rect x={0} y={0} width={contentWidth} height={height+10} rx={32} fill="white"></Rect>
          </Mask>

          <Mask id="imageMask">
            <Circle
              cx={padding.x + imageDim.width/2}
              cy={ padding.y + imageDim.height/2 }
              r={ imageDim.width }
              fill="white"
            />
          </Mask>
          <Mask id="timesMask">
            <Circle
              cx={contentWidth}
              cy={timesStyle.height/2}
              r={timesStyle.height}
              fill="white"
            />

            <Circle
              cx={contentWidth + timeListIcon.width*2/3 - 17}
              cy={height/2}
              r={timeListIcon.height*2/3}
              fill="black"
            />
          </Mask>
        </Defs>

        <Rect
          x={0}
          y={0}
          width={20}
          height={height+5}
          fill="url(#leftShadowGradient)"
          mask="url(#leftShadowMask)"
        />

        <Rect
          x={0}
          y={height-5}
          width={contentWidth}
          height={15}
          fill="url(#bottomShadowGradient)"
          mask="url(#bottomShadowMask)"
        />

        <Rect
          x={0}
          y={0}
          fill={behaviorColor}
          width={contentWidth}
          height={timesStyle.height}
          rx="5"
          ry="5"
          opacity={grantTime ? 0.8 : 1}
          mask="url(#timesMask)"
        />
      </Svg>

      <View
        style={{
          position: 'absolute',
          width: imageDim.width + padding.x,
          height,
          shadowColor: 'black',
          shadowOffset: { width: -2, height: -2 },
          shadowOpacity: 0.5,
          shadowRadius: 2,
          opacity: grantTime ? 0.8 : 1
        }}
      >
        {
          image &&
            <CachedImage
              style={imageStyle}
              source={{ uri: image }}
            />
          ||
            <View
              style={{
                ...imageStyle,
                backgroundColor: '#CBCBCB'
              }}
            />
        }
      </View>

      <View
        style={{
          position: 'absolute',
          left: padding.x + imageDim.width,
          width: contentWidth - imageDim.width - padding.x - timesStyle.width,
          height,
          opacity: grantTime ? 0.8 : 1
        }}
      >
        <Text style={{
          fontSize: 20, paddingLeft: 5, paddingTop: padding.y,
        }}>{ name }</Text>
      </View>

      <View
        style={{
          position: 'absolute',
          left: contentWidth - timesStyle.width,
          top: 0,
          justifyContent: 'center',
          flexDirection: 'column',
          flex: 1,
          ...timesStyle
        }}
      >
        <Text style={styles.timesText}>{times}</Text>
        <Text style={{...styles.timesText, fontSize: 15}}>Times</Text>
      </View>

      <TouchableOpacity
        style={{
          position: 'absolute',
          right: 0,
          top: (height - timeListIcon.height) / 2,
          width: timeListIcon.width,
          height: timeListIcon.height,
          borderRadius: timeListIcon.width/2,
          backgroundColor: 'white',
          shadowColor: 'black',
          shadowOffset: {width: 0, height: 6},
          shadowOpacity: 0.2,
          shadowRadius: 5,
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onPress={() => {
          if (times) {
            onTimesMenu();
          }
        }}
        activeOpacity={times ? 0.2 : 1}
      >
        <Svg width={timeListIcon.width} height={timeListIcon.height}>
          <Defs>
            <LinearGradient id="topToBottom" x1="0%" x2="0%" y1="0%" y2="100%">
              <Stop offset="0" stopColor={'#DFDFDF'} stopOpacity={1} key='0' />
              <Stop offset="1" stopColor={'#F5F5F5'} stopOpacity={1} key='1' />
            </LinearGradient>
          </Defs>

          {
            timeListItems.map(index => {
              const dx = (timeListIcon.width/2 - 14) / 2;
              const dy = (timeListIcon.height - timeListItems.length * 14)/2 + 7;
              return (
                <G key={index}>
                  <Rect x={dx} y={index*14 + dy} width={8} height={8} rx={4} fill={!times ? 'url(#topToBottom)' : behaviorColor} />
                  <Rect x={dx+14} y={index*14 + dy} width={timeListIcon.width/2} height={8} rx={4} fill={!times ? 'url(#topToBottom)' : behaviorColor} />
                </G>
              )
            })
          }
        </Svg>

        {
          ready && (
            <View style={{
              position: 'absolute',
              right: 0,
              top: 0
            }}>
              <Icon
                type="FontAwesome"
                name="check-circle"
                style={{ color: behaviorColor }}
              />
            </View>
          ) || <></>
        }
      </TouchableOpacity>
    </View>
  )
};

BehaviorCard.propTypes = {
  name: PropTypes.string,
  times: PropTypes.number,
  image: PropTypes.string,
  ready: PropTypes.bool,
  behaviorType: PropTypes.string,
  onPress: PropTypes.func,
  onLongPress: PropTypes.func,
  onTimesMenu: PropTypes.func
};
