import React, { useState, useRef } from 'react';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { Image, TouchableOpacity, StyleSheet, View, ScrollView, Text, StatusBar } from 'react-native';
import { Icon } from 'native-base';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment';
import Slider2D from '../../components/Slider2D';
import { CachedImage } from 'react-native-img-cache';

import { setCurrentBehavior } from '../../state/responses/responses.actions';
import { currentBehaviorSelector } from '../../state/responses/responses.selectors';

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
  imageStyle: {
    width: 50,
    height: 50,
    resizeMode: 'cover',
    backgroundColor: '#EFEFEF',
    borderRadius: 25,
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
  const { name, type, image, inputType } = currentBehavior;
  const [sliderWidth, setSliderWidth] = useState(0);
  const [cancelContentTouches, setCancelContentTouches] = useState(true);
  const padding = 40;
  const borderRadius = 16;
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
      image,
      list: items,
      inputType
    })

    if (!items.length) {
      Actions.pop()
    }
  }

  const updateValues = (item, distress, impairment, submit) => {
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
        image,
        list: items,
        inputType
      })
    }
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
      image,
      list: items,
      inputType
    })

    setShowTimePicker(false);
  }

  const toggleContentTouches = (value) => {
    setCancelContentTouches(value);
  }

  return (
    <ScrollView
      style={{
        ...styles.container,
        backgroundColor: type == 'positive' ? '#20609D' : '#7A43A0',
      }}
      canCancelContentTouches={cancelContentTouches}
    >
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
                <CachedImage
                  style={styles.imageStyle}
                  source={{ uri: image }}
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
                  disabled={inputType != 'pastBehaviorTracker'}
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
                <Slider2D
                  borderRadius={borderRadius}
                  borderColor={borderColor}
                  sliderWidth={sliderWidth}
                  padding={padding}
                  item={item}
                  type={type}
                  disabled={false}
                  onToggle={toggleContentTouches}
                  onChange={(distress, impairment, submit) => updateValues(item, distress, impairment, submit)}
                />
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
