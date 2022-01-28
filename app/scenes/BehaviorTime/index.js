import React, { useState, useRef } from 'react';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { Image, TouchableOpacity, StyleSheet, View, ScrollView, Text, StatusBar } from 'react-native';
import { Icon } from 'native-base';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment';
import Slider2D from '../../components/Slider2D';
import { CachedImage } from 'react-native-img-cache';
import Modal from 'react-native-modal';

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
    right: 6,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modal: {
    width: '80%',
    backgroundColor: '#E2EBF5',
    alignSelf: 'center',
    shadowColor: 'grey',
    shadowRadius: 5,
    borderRadius: 15
  },
  modalButton: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 15
  },
  modalButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500'
  }
})

const BehaviorTime = ({ currentBehavior, setCurrentBehavior }) => {
  const { name, type, image, inputType } = currentBehavior;
  const [sliderWidth, setSliderWidth] = useState(0);
  const [cancelContentTouches, setCancelContentTouches] = useState(true);
  const padding = 40;
  const borderRadius = 16;
  const [list, setList] = useState(currentBehavior.list);
  const [modalVisible, setModalVisible] = useState(false);
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
      inputType,
      defaultTime: currentBehavior.defaultTime
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
        inputType,
        defaultTime: currentBehavior.defaultTime
      })
    }
  }

  const setTime = (time) => {
    const now = Date.now(), day = 86400 * 1000;

    if (time.getTime() > now) {
      time.setDate(time.getDate()-1);
    } else if (time.getTime() + day <= now) {
      time.setDate(time.getDate()+1);
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
      inputType,
      defaultTime: time.getTime()
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

      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
      >
        <View style={styles.modal}>
          <View style={{ marginHorizontal: 20, marginTop: 32 }}>
            <Text style={{ textAlign: 'center', fontSize: 17 }}>Are you sure you want to remove this observation?</Text>
          </View>

          <View style={{ marginVertical: 20, flexDirection: 'row', justifyContent: 'space-around' }}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#FF5053' }]}
              onPress={() => {
                setModalVisible(false);
                deleteItem(currentItem.current);
              }}
            >
              <Text style={styles.modalButtonText}>Yes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#20609D' }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <DateTimePickerModal
        isVisible={showTimePicker}
        date={new Date(currentBehavior.defaultTime)}
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
                {
                  image && <CachedImage
                    style={styles.imageStyle}
                    source={{ uri: image }}
                  /> || <View style={styles.imageStyle} />
                }

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
                  setSliderWidth(Math.min(width, height) / 1.25 - padding)
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

              <TouchableOpacity style={styles.cardXButton} onPress={() => {
                currentItem.current = item;
                setModalVisible(true)
              }}>
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
