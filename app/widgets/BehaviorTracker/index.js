import React, { Component } from 'react';
import { View, KeyboardAvoidingView, Text, Platform, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
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
    width: '70%',
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
  }

  increaseOccurrence (behavior) {
    const {
      value = {}
    } = this.props.value || {}

    if (value[behavior]) {
      value[behavior] = [ ...value[behavior] ]
    } else {
      value[behavior] = []
    }

    value[behavior].push({
      time: 0,
      distress: null,
      impairment: null
    })

    this.props.onChange({
      ...(this.props.value || {}),
      value
    })
  }

  onSetOccurance () {
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
      value[behavior].push({ time: 0, distress: null, impairment: null })
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

      value[name] = list;
      this.props.onChange({
        ...this.props.value,
        value
      });
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
      setCurrentBehavior
    } = this.props;

    let {
      value = {},
      timerActive = true,
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
            <View style={{ marginVertical: 20 }}>
              <Text style={{ textAlign: 'center', fontSize: 25 }}>{selectedBehavior}</Text>
            </View>

            <View style={{ marginVertical: 20, flexDirection: 'row', justifyContent: 'space-around' }}>
              <TouchableOpacity
                style={styles.upButton}
                onPress={() => this.setState({ itemCount: itemCount+1 })}
              />

              <TextInput
                style={styles.inputStyle}
                keyboardType={"numeric"}
                onChangeText={text => this.setState({ itemCount: isNaN(text) ? 0 : Number(text) })}
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
                onPress={() => {
                  if (timerActive) {
                    this.increaseOccurrence(behavior.name)
                  }
                }}
                onLongPress={() => {
                  if (timerActive) {
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
                    type: behavior.type
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
