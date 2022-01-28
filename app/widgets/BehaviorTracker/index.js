import React, { Component } from 'react';
import { View, KeyboardAvoidingView, Text, Platform, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Input } from 'native-base';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { BehaviorCard } from './BehaviorCard';
import { Actions } from 'react-native-router-flux';
import Modal from 'react-native-modal';

import { setCurrentBehavior } from '../../state/responses/responses.actions';
import { currentBehaviorSelector } from '../../state/responses/responses.selectors';

const styles = StyleSheet.create({
  doneButtonStyle: {
    backgroundColor: '#20609D',
    borderRadius: 15,
    width: 80,
    alignSelf: 'center'
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    padding: 10,
    fontSize: 18
  },
  modal: {
    width: '80%',
    backgroundColor: 'white',
    alignSelf: 'center',
    shadowColor: 'grey',
    shadowRadius: 5,
    borderRadius: 15
  },
  inputStyle: {
    lineHeight: 20,
    borderColor: '#ABC3DA',
    textAlign: 'center',
    borderWidth: 2,
    borderRadius: 16,
    flexGrow: 1,
    paddingHorizontal: 5,
    fontSize: 16,
    maxWidth: 100
  },
  upButton: {
    width: 0, height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 20, borderRightWidth: 20,
    borderBottomWidth: 35,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderBottomColor: '#20609D',
    shadowColor: 'grey', shadowRadius: 2, shadowOpacity: 1
  },
  downButton: {
    width: 0, height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 20, borderRightWidth: 20,
    borderTopWidth: 35,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderTopColor: '#FF5053',
    shadowColor: 'grey', shadowRadius: 2, shadowOpacity: 1
  }
});

export class BehaviorTrackerComponent extends Component {
  constructor (props) {
    super(props);
    this.state = {
      modalVisible: false,
      selectedBehavior: '',
      itemCount: 0
    };

    this.maxOccurrence = 99;
  }

  increaseOccurrence (behavior) {
    const {
      value = {}
    } = this.props.value || {};

    const { inputType } = this.props;

    if (value[behavior]) {
      value[behavior] = [ ...value[behavior] ]
    } else {
      value[behavior] = []
    }

    value[behavior].push({
      time: inputType == 'pastBehaviorTracker' ?  null : new Date().getTime(),
      distress: null,
      impairment: null
    })

    this.props.onChange({
      ...(this.props.value || {}),
      value
    })
  }

  onSetOccurance () {
    if (this.state.itemCount > this.maxOccurrence || this.state.itemCount < 0) {
      return ;
    }

    this.setState({ modalVisible: false });
    const {
      value = {}
    } = this.props.value || {};

    const behavior = this.state.selectedBehavior;

    if (value[behavior]) {
      value[behavior] = [ ...value[behavior] ]
    } else {
      value[behavior] = []
    }

    while (value[behavior].length > this.state.itemCount) {
      value[behavior].pop();
    }
    while (value[behavior].length < this.state.itemCount) {
      value[behavior].push({ time: null, distress: null, impairment: null })
    }

    if (!value[behavior].length) {
      delete value[behavior];
    }

    this.props.onChange({
      ...(this.props.value || {}),
      value
    })
  }

  componentDidUpdate (oldProps) {
    if (oldProps.currentBehavior != this.props.currentBehavior) {
      const {
        value = {}
      } = this.props.value

      const { name, list } = this.props.currentBehavior;

      if (name) {
        value[name] = list;
        this.props.onChange({
          ...this.props.value,
          value
        });
      }
    }
  }

  isReady (behavior) {
    if (!behavior || !behavior.length) {
      return false;
    }
    for (const item of behavior) {
      if (!item.time || item.distress === null || item.impairment === null) {
        return false;
      }
    }

    return true;
  }

  render () {
    const {
      config: {
        positiveBehaviors,
        negativeBehaviors,
      },
      inputType,
      setCurrentBehavior,
      currentBehavior
    } = this.props;

    let {
      value = {},
      timerActive = true,
      timeLeft = 1,
    } = (this.props.value || {});

    const {
      modalVisible, selectedBehavior, itemCount
    } = this.state;

    const behaviors = [];
    for (const behavior of positiveBehaviors) {
      behaviors.push({
        ...behavior,
        ready: this.isReady(value[behavior.name]),
        type: 'positive',
      })
    }

    for (const behavior of negativeBehaviors) {
      behaviors.push({
        ...behavior,
        ready: this.isReady(value[behavior.name]),
        type: 'negative'
      })
    }

    return (
      <KeyboardAvoidingView>
        <Modal
          isVisible={modalVisible}
          onBackdropPress={() => this.setState({ modalVisible: false })}
        >
          <View style={styles.modal}>
            <View style={{ margin: 20 }}>
              <Text style={{ textAlign: 'center', fontSize: 25 }}>{selectedBehavior}</Text>
            </View>

            <View style={{ marginVertical: 20, flexDirection: 'row', justifyContent: 'space-around' }}>
              <TouchableOpacity
                style={styles.upButton}
                onPress={() => this.setState({ itemCount: Math.min(this.maxOccurrence, itemCount+1) })}
              />

              <Input
                style={styles.inputStyle}
                maxLength={2}
                onChangeText={text => this.setState({ itemCount: Math.min(this.maxOccurrence, isNaN(text) ? 0 : Number(text)) })}
                keyboardType={"numeric"}
                value={`${itemCount}`}
              />

              <TouchableOpacity
                style={styles.downButton}
                onPress={() => this.setState({ itemCount: Math.max(0, itemCount-1) })}
              />
            </View>

            <View style={{ marginVertical: 20, flexDirection: 'row', justifyContent: 'space-around' }}>
              <TouchableOpacity
                style={styles.doneButtonStyle}
                onPress={() => this.setState({ itemCount: 0 })}
              >
                <Text style={styles.buttonText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.doneButtonStyle}
                onPress={this.onSetOccurance.bind(this)}
              >
                <Text style={styles.buttonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <View style={{ alignItems: 'stretch' }}>
          {
            behaviors.map((behavior, index) => (
              <BehaviorCard
                key={index}
                name={behavior.name}
                times={(value[behavior.name] || []).length}
                image={behavior.image || ''}
                ready={behavior.ready}
                behaviorType={behavior.type}
                active={timeLeft > 0 || timerActive}
                onPress={() => {
                  if (timerActive && (value[behavior.name] || []).length < this.maxOccurrence) {
                    this.increaseOccurrence(behavior.name)
                  } else if (timeLeft > 0) {
                    this.props.onChange({
                      ...(this.props.value || {}),
                      timerActive: true
                    })
                  }
                }}
                onLongPress={() => {
                  if (timerActive && inputType == 'pastBehaviorTracker') {
                    this.setState({
                      modalVisible: true,
                      selectedBehavior: behavior.name,
                      itemCount: (value[behavior.name] || []).length
                    })
                  }
                }}
                onTimesMenu={() => {
                  setCurrentBehavior({
                    name: behavior.name,
                    image: behavior.image,
                    list: value[behavior.name],
                    type: behavior.type,
                    inputType,
                    defaultTime: currentBehavior.defaultTime || new Date().getTime()
                  })
                  Actions.push('set_behavior_times')
                }}
              />
            ))
          }
        </View>
      </KeyboardAvoidingView>
    )
  }
}

BehaviorTrackerComponent.propTypes = {
  config: PropTypes.object,
  inputType: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.any,
  setCurrentBehavior: PropTypes.func.isRequired,
  currentBehavior: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  currentBehavior: currentBehaviorSelector(state),
});

const mapDispatchToProps = dispatch => ({
  setCurrentBehavior: (behavior) => dispatch(setCurrentBehavior(behavior))
});

export const BehaviorTracker = connect(
  mapStateToProps,
  mapDispatchToProps,
)(BehaviorTrackerComponent);
