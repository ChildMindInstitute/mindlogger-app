import React from 'react'
import Svg, { Rect, Text, Defs, Mask, G, LinearGradient, Stop, Circle } from 'react-native-svg'
import { View, Image } from 'react-native';

const doubleArrow = require('../../img/double-arrow.png');
const pointer = require('../../img/pointer.png');

const Slider2D = ({ sliderWidth, padding, onToggle, item, borderRadius, onChange, type, borderColor, disabled, axisHeight=10 }) => {
  const distress = '#EC0C8B', impairment = '#0FB0EC';
  const axis = [0,1,2,3,4,5,6,7,8,9,10], delta = (1-Math.sqrt(0.5)) * borderRadius;

  const renderMainAxis = (direction, value, color) => {
    const perecent = value*100/(axis.length-1);

    if (disabled && value === null) {
      return <></>
    }

    return (
      <>
        <Defs>
          <LinearGradient id="background" x1="0%" y1="0%" x2="0%" y2="100%" >
            <Stop offset="0" stopColor={type == 'positive' ? '#0C3B61' : '#492265'} stopOpacity={1} key='0' />
            <Stop offset="1" stopColor={type == 'positive' ? '#0D3F69' : '#492265'} stopOpacity={1} key='1' />
          </LinearGradient>

          <LinearGradient id="foreground" x1={50 - direction*50 + '%'} x2={50 + direction*50 + '%'} y1="0%" y2="0%" >
            <Stop offset="0" stopColor={'white'} stopOpacity={1} key='0' />
            <Stop offset="1" stopColor={color} stopOpacity={1} key='1' />
          </LinearGradient>

          <Mask id="foreground-mask">
            <Rect
              x={ (direction < 0 ? (100-perecent) : 0) + '%'}
              y="0%"
              width ={ (direction < 0 ? 100 : perecent ) + '%'}
              height="100%"
              fill={'white'}
            />
          </Mask>
        </Defs>

        <Rect x="0" y="0" width="100%" height="100%" fill="url(#background)" stroke="#3B4677" strokeWidth="2" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#foreground)" mask="url(#foreground-mask)" />
      </>
    )
  }

  const getX = (sliderWidth, index) => {
    return (sliderWidth - delta*2) / (axis.length-1) * index + delta;
  }

  const updateValues = (distress, impairment, submit) => {
    const rate = (sliderWidth - delta*2) / (axis.length-1);

    distress = axis.length - 1 - Math.round((distress-delta) / rate)
    impairment = axis.length - 1 - Math.round((impairment-delta) / rate)

    onChange(distress, impairment, submit)
  }

  return (
    <View
      style={{
        width: sliderWidth + padding,
        height: sliderWidth + padding,
        transform: [{ rotateZ: '45deg' }, { translateX: 10 }, { translateY: 10 }],
        flexDirection: 'row',
        position: 'relative'
      }}
    >
      <View style={{ width: sliderWidth }}>
        <Svg
          width={sliderWidth} height={sliderWidth}
          onStartShouldSetResponder={() => true}
          onResponderGrant={(evt) => {
            const { locationX, locationY } = evt.nativeEvent;
            if (!disabled) {
              updateValues(locationX, locationY, false)
            }
          }}
          onResponderMove={(evt) => {
            const { locationX, locationY } = evt.nativeEvent;
            if (!disabled) {
              updateValues(locationX, locationY, false)
            }
          }}
          onResponderRelease={(evt) => {
            const { locationX, locationY } = evt.nativeEvent;
            if (!disabled) {
              updateValues(locationX, locationY, true)
            }
          }}
        >
          <Defs>
            <Mask id="region">
              <Rect x={0} y={0} width={sliderWidth} height={sliderWidth} fill="white" rx={borderRadius} />
            </Mask>

            <LinearGradient id="right-to-left" x1="100%" x2="0%" y1="0%" y2="0%">
              <Stop offset="0" stopColor={'black'} stopOpacity={1} key='0' />
              <Stop offset="1" stopColor={'white'} stopOpacity={1} key='1' />
            </LinearGradient>

            <LinearGradient id="bottom-to-top" x1="0%" x2="0%" y1="100%" y2="0%">
              <Stop offset="0" stopColor={'black'} stopOpacity={1} key='0' />
              <Stop offset="1" stopColor={'white'} stopOpacity={1} key='1' />
            </LinearGradient>

            <Mask id="distress-mask">
              <Rect x={0} y={0} width={sliderWidth} height={sliderWidth} fill="url(#right-to-left)" />
            </Mask>

            <Mask id="impairment-mask">
              <Rect x={0} y={0} width={sliderWidth} height={sliderWidth} fill="url(#bottom-to-top)" />
            </Mask>

            <Mask id="axis-region">
              <Rect x={delta} y={delta} width={sliderWidth-delta*2+1} height={sliderWidth-delta*2+1} fill="white" />
            </Mask>
          </Defs>

          <G
            mask="url(#region)"
          >
            <Rect x={0} y={0} width={sliderWidth} height={sliderWidth} fill="white" />
            <Rect x={0} y={0} width={sliderWidth} height={sliderWidth} fill={impairment} mask="url(#impairment-mask)" />
            <Rect x={0} y={0} width={sliderWidth} height={sliderWidth} fill={distress} mask="url(#distress-mask)" />

            <G mask="url(#axis-region)">
              {
                !disabled && axis.map(x => {
                  return (
                    <Rect
                      key={x}
                      x={getX(sliderWidth, x)}
                      y={0}
                      width={1}
                      height={sliderWidth}
                      fill={'white'}
                    />
                  )
                }) || []
              }
            </G>

            <G mask="url(#axis-region)">
              {
                !disabled && axis.map(y => {
                  return (
                    <Rect
                      key={y}
                      x={0}
                      y={getX(sliderWidth, y)}
                      width={sliderWidth}
                      height={1}
                      fill={'white'}
                    />
                  )
                }) || []
              }
            </G>

            {
              item.distress !== null && item.impairment !== null &&
                <G>
                  {
                    !disabled && (
                      <>
                        <Circle
                          cx={getX(sliderWidth, axis.length-1-item.distress)}
                          cy={getX(sliderWidth, axis.length-1-item.impairment)}
                          r={8}
                          fill={'white'}
                          fillOpacity={0.5}
                        />
                        <Circle
                          cx={getX(sliderWidth, axis.length-1-item.distress)}
                          cy={getX(sliderWidth, axis.length-1-item.impairment)}
                          r={6}
                          fill={'white'}
                        />
                      </>
                    ) || (
                      <Circle
                        cx={getX(sliderWidth, axis.length-1-item.distress)}
                        cy={getX(sliderWidth, axis.length-1-item.impairment)}
                        r={6}
                        fill={'black'}
                      />
                    )
                  }
                  <Circle
                    cx={getX(sliderWidth, axis.length-1-item.distress)}
                    cy={getX(sliderWidth, axis.length-1-item.impairment)}
                    r={5}
                    fill={'#34E7DE'}
                  />
                </G>
            }
          </G>
        </Svg>

        <Svg
          width={sliderWidth-borderRadius}
          height={axisHeight}
          style={{ marginTop: 8, marginBottom: 2, marginLeft: borderRadius/2 }}
        >
          { renderMainAxis(-1, item.distress, distress) }
        </Svg>

        {
          !disabled && (
            <Svg width={sliderWidth} height={20}>
              <Defs>
                <LinearGradient id="left-to-right" x1="0%" x2="100%" y1="0%" y2="0%">
                  <Stop offset="0" stopColor={distress} stopOpacity={1} key='0' />
                  <Stop offset="0.6" stopColor={'white'} stopOpacity={1} key='1' />
                </LinearGradient>

                <Mask id="text-mask">
                  <Text
                    x={sliderWidth/2}
                    y={15}
                    textAnchor="middle"
                    fontSize="15"
                    fontWeight="600"
                    fill={'white'}
                  >
                    Distress
                  </Text>
                </Mask>
              </Defs>
              <Rect
                x={0}
                y={0}
                width={'100%'}
                height={'100%'}
                fill="url(#left-to-right)"
                mask="url(#text-mask)"
              />
            </Svg>
          )
        }
      </View>

      <View style={{
        width: padding,
        height: sliderWidth,
      }}>
        <View
          style={{
            width: sliderWidth,
            height: padding,
            transform: [
              {translateX: -sliderWidth/2},
              {translateY: -padding/2},
              {rotateZ: '-90deg'},
              {translateX: -sliderWidth/2},
              {translateY: padding/2}
            ]
          }}
        >
          <Svg
            width={sliderWidth - borderRadius}
            height={axisHeight}
            style={{ marginTop: 8, marginBottom: 2, marginLeft: borderRadius/2 }}
          >
            { renderMainAxis(1, item.impairment, impairment) }
          </Svg>

          {
            !disabled && (
              <Svg width={sliderWidth} height={20}>
                <Defs>
                  <LinearGradient id="left-to-right" x1="0%" x2="100%" y1="0%" y2="0%">
                    <Stop offset="0.2" stopColor={'white'} stopOpacity={1} key='0' />
                    <Stop offset="1" stopColor={impairment} stopOpacity={1} key='1' />
                  </LinearGradient>

                  <Mask id="text-mask">
                    <Text
                      fill={'white'}
                      fontWeight="600"
                      fontSize="15"
                      x={sliderWidth/2}
                      y={15}
                      textAnchor="middle"
                    >Impairment</Text>
                  </Mask>
                </Defs>

                <Rect
                  x={0}
                  y={0}
                  width={'100%'}
                  height={'100%'}
                  fill="url(#left-to-right)"
                  mask="url(#text-mask)"
                />
              </Svg>
            )
          }
        </View>
      </View>

      {
        item.distress === null && item.impairment == null && !disabled &&
        <>
          <Image
            style={{
              position: 'absolute',
              opacity: 0.6,
              top: sliderWidth*0.32,
              left: sliderWidth/10
            }}
            width={sliderWidth/3}
            height={sliderWidth/2}
            source={doubleArrow}
          />

          <Image
            style={{
              position: 'absolute',
              opacity: 0.6,
              left: sliderWidth*0.4,
              transform: [{rotateZ: '90deg'}]
            }}
            width={sliderWidth/3}
            height={sliderWidth/2}
            source={doubleArrow}
          />

          <Image
            style={{
              position: 'absolute',
              opacity: 0.6,
              top: sliderWidth/4,
              left: sliderWidth/4,
              transform: [{rotateZ: '-45deg'}]
            }}
            width={sliderWidth*2/3}
            height={sliderWidth*2/3}
            source={pointer}
          />
        </>
      }

      <View
        style={{
          position: 'absolute',
          width: sliderWidth,
          height: sliderWidth,
          borderRadius,
          borderColor: (item.distress !== null || item.impairment !== null) ? borderColor : 'rgba(0,0,0,0)',
          borderWidth: 2
        }}
        onStartShouldSetResponder={() => true}
        onResponderGrant={(evt) => {
          const { locationX, locationY } = evt.nativeEvent;

          if (!disabled) {
            updateValues(locationX, locationY, false)
          }
          onToggle(false);
        }}
        onResponderMove={(evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          if (!disabled) {
            updateValues(locationX, locationY, false)
          }
          onToggle(false);
        }}
        onPanResponderTerminate={() => {
          onToggle(true);
        }}

        onResponderRelease={(evt) => {
          const { locationX, locationY } = evt.nativeEvent;

          if (!disabled) {
            updateValues(locationX, locationY, true)
          }
        }}
        
      ></View>
    </View>
  )
}

export default Slider2D;
