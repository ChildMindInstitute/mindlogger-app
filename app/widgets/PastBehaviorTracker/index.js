import React, { Component } from 'react';
import { View, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { BehaviorCard } from '../BehaviorCard';
import { Actions } from 'react-native-router-flux';

import { setCurrentBehavior } from '../../state/responses/responses.actions';
import { currentBehaviorSelector } from '../../state/responses/responses.selectors';

export class PastBehaviorTrackerComponent extends Component {
  increaseOccurrence(behavior) {
    const value = { ...this.props.value }
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

    this.props.onChange(value)
  }

  componentDidUpdate(oldProps) {
    if (oldProps.currentBehavior != this.props.currentBehavior) {
      const value = { ...this.props.value }
      const { name, list } = this.props.currentBehavior;

      value[name] = list;
      this.props.onChange(value);
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
        negativeBehaviors
      },
      value = {},
      setCurrentBehavior
    } = this.props;

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
                onPress={() => this.increaseOccurrence(behavior.name)}
                onLongPress={() => {

                }}
                onTimesMenu={() => {
                  setCurrentBehavior({
                    name: behavior.name,
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

PastBehaviorTrackerComponent.propTypes = {
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

export const PastBehaviorTracker = connect(
  mapStateToProps,
  mapDispatchToProps,
)(PastBehaviorTrackerComponent);
