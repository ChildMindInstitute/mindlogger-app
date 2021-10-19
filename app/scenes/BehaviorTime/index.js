import React, { useState, useRef } from 'react';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { TouchableOpacity, StyleSheet, View, ScrollView, Text, StatusBar } from 'react-native';
import { Image } from 'react-native';
import { Icon } from 'native-base';
import Svg, { Rect, Defs, Mask, G, LinearGradient, Stop, Circle } from 'react-native-svg'
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment';

import { setCurrentBehavior } from '../../state/responses/responses.actions';
import { currentBehaviorSelector } from '../../state/responses/responses.selectors';

const negative = require('../../../img/negative.png');
const positive = require('../../../img/positive.png');
const doubleArrow = require('../../../img/double-arrow.png');
const pointer = require('../../../img/pointer.png');

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%'
  },
  screenXButton: {
    position: 'absolute',
    top: 10,
    right: 15,
  },
  card: {
    width: '95%',
    height: 200,
    borderRadius: 25,
    marginTop: 10,
    position: 'relative'
  },
  cardXButton: {
    position: 'absolute',
    left: 10,
    top: 10
  },
  readyButton: {
    position: 'absolute',
    right: 10,
    top: 10
  },
  cardTitle: {
    color: 'white',
    top: 10,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600'
  },
  timeSection: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  timeText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 18,
    fontWeight: '600'
  },
  sliderSection: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    right: 0,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

const BehaviorTime = ({ currentBehavior, setCurrentBehavior }) => {
  const { name, type } = currentBehavior;
  const [sliderWidth, setSliderWidth] = useState(0);
  const distress = '#EC0C8B', impairment = '#0FB0EC', padding = 40;
  const borderRadius = 16;
  const axis = [0,1,2,3,4,5,6,7,8,9,10], delta = (1-Math.sqrt(0.5)) * borderRadius;
  const [list, setList] = useState(currentBehavior.list);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const currentItem = useRef(null);
  const borderColor = '#44E7DE';

  const orderedList = list.map((item, index) => ({
    ...item,
    index,
    timeStr: moment(new Date(item.time)).format('hh:mm A'),
    ready: item.time && item.distress !== null && item.impairment !== null
  })).sort((a, b) => {
    if (!a.time) return -1;
    if (!b.time) return 1;

    if (a.time > b.time) return -1;
    if (a.time < b.time) return 1;

    return 0;
  })

  const deleteItem = (item) => {
    const items = [...list];
    items.splice(item.index, 1);

    setList(items)
    setCurrentBehavior({
      name,
      type,
      list: items
    })
  }

  const updateValues = (item, distress, impairment, submit) => {
    const rate = (sliderWidth - delta*2) / (axis.length-1);

    distress = axis.length - 1 - Math.round((distress-delta) / rate)
    impairment = axis.length - 1 - Math.round((impairment-delta) / rate)

    if (!submit && item.distress == distress && item.impairment == impairment) {
      return
    }

    const items = [...list];

    items[item.index] = {
      time: item.time,
      distress,
      impairment
    }

    setList(items)

    if (submit) {
      setCurrentBehavior({
        name,
        type,
        list: items
      })
    }
  }

  const getX = (sliderWidth, index) => {
    return (sliderWidth - delta*2) / (axis.length-1) * index + delta;
  }

  const renderMainAxis = (direction, value, color) => {
    const perecent = value*100/(axis.length-1);

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

  const setTime = (time) => {
    if (time.getTime() > new Date().getTime()) {
      time.setDate(time.getDate()-1);
    }

    const item = currentItem.current;

    const items = [...list];
    items[item.index] = {
      time: time.getTime(),
      distress: item.distress,
      impairment: item.impairment,
    }

    setList(items)
    setCurrentBehavior({
      name,
      type,
      list: items
    })

    setShowTimePicker(false);
  }

  return (
    <ScrollView style={{
      ...styles.container,
      backgroundColor: type == 'positive' ? '#20609D' : '#7A43A0',
    }}>
      <StatusBar hidden />

      <DateTimePickerModal
        isVisible={showTimePicker}
        mode="time"
        onConfirm={setTime}
        onCancel={() => setShowTimePicker(false)}
      />

      <TouchableOpacity style={styles.screenXButton} onPress={() => Actions.pop()}>
        <Icon
          type="FontAwesome"
          name="close"
          style={{ color: '#D0D0D0' }}
        />
      </TouchableOpacity>

      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          marginTop: 50,
          marginBottom: 20
        }}
      >
        {
          orderedList.map(item => (
            <View
              style={{
                ...styles.card,
                backgroundColor: type == 'positive' ? '#0D426D' : '#50256F',
                borderColor: item.ready ? borderColor : 'rgba(0,0,0,0)',
                borderWidth: 1
              }}
              key={item.index}
            >
              <Text style={{
                ...styles.cardTitle,
                color: item.ready ? borderColor : 'white'
              }}>{ item.index+1 } out of { orderedList.length }</Text>

              <View style={styles.timeSection}>
                <Image
                  source={type == 'positive' ? positive : negative }
                />

                <TouchableOpacity
                  style={{
                    marginTop: 10,
                    borderRadius: 16,
                    height: 32,
                    width: '60%',
                    backgroundColor: type == 'positive' ? '#4AA7F5' : '#BB71F0',
                    justifyContent: 'center',
                    borderColor: item.time ? borderColor : 'rgba(0,0,0,0)',
                    borderWidth: 2
                  }}
                  onPress={() => {
                    currentItem.current = item;
                    setShowTimePicker(true)
                  }}
                >
                  <Text style={styles.timeText}>
                    {!item.time ? 'Time' : item.timeStr}
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={styles.sliderSection}
                onLayout={(evt) => {
                  const { width, height } = evt.nativeEvent.layout;
                  setSliderWidth(Math.min(width, height) / 1.2 - padding)
                }}
              >
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
                        updateValues(item, locationX, locationY, false)
                      }}
                      onResponderMove={(evt) => {
                        const { locationX, locationY } = evt.nativeEvent;
                        updateValues(item, locationX, locationY, false)
                      }}
                      onResponderRelease={(evt) => {
                        const { locationX, locationY } = evt.nativeEvent;
                        updateValues(item, locationX, locationY, true)
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
                            axis.map(x => {
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
                            })
                          }
                        </G>

                        <G mask="url(#axis-region)">
                          {
                            axis.map(y => {
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
                            })
                          }
                        </G>

                        {
                          item.distress !== null && item.impairment !== null &&
                            <G>
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
                      height={10}
                      style={{ marginTop: 8, marginBottom: 2, marginLeft: borderRadius/2 }}
                    >
                      { renderMainAxis(-1, item.distress, distress) }
                    </Svg>

                    <Text
                      style={{
                        textAlign: 'center',
                        color: distress,
                        fontWeight: '600',
                        fontSize: 15
                      }}
                    >
                      Distress
                    </Text>
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
                        height={10}
                        style={{ marginTop: 8, marginBottom: 2, marginLeft: borderRadius/2 }}
                      >
                        { renderMainAxis(1, item.impairment, impairment) }
                      </Svg>

                      <Text
                        style={{
                          color: impairment,
                          fontWeight: '600',
                          fontSize: 15,
                          width: sliderWidth,
                          textAlign: 'center',
                        }}
                      >Impairment</Text>
                    </View>
                  </View>

                  {
                    item.distress === null && item.impairment == null &&
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
                      updateValues(item, locationX, locationY, false)
                    }}
                    onResponderMove={(evt) => {
                      const { locationX, locationY } = evt.nativeEvent;
                      updateValues(item, locationX, locationY, false)
                    }}
                    onResponderRelease={(evt) => {
                      const { locationX, locationY } = evt.nativeEvent;
                      updateValues(item, locationX, locationY, true)
                    }}
                  ></View>
                </View>
              </View>

              <TouchableOpacity style={styles.cardXButton} onPress={() => deleteItem(item)}>
                <Icon
                  type="FontAwesome"
                  name="close"
                  style={{ color: 'white', fontSize: 25, borderColor: 'black' }}
                />
              </TouchableOpacity>

              {
                item.ready &&
                  <View style={{
                    ...styles.readyButton,
                    borderWidth: 2,
                    borderRadius: 15,
                    padding: 2,
                    borderColor,
                  }}>
                    <Icon
                      type="FontAwesome"
                      name="check"
                      style={{ color: borderColor, fontSize: 20, borderColor: 'black' }}
                    />
                  </View>
                ||
                  <></>
              }
            </View>
          ))
        }
      </View>
    </ScrollView>
  )
};

BehaviorTime.propTypes = {
};

const mapStateToProps = state => ({
  currentBehavior: currentBehaviorSelector(state),
});

const mapDispatchToProps = dispatch => ({
  setCurrentBehavior: (behavior) => dispatch(setCurrentBehavior(behavior))
});


export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(BehaviorTime);
