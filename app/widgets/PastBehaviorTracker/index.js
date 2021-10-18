import React, { Component } from 'react';
import { View, StyleSheet, KeyboardAvoidingView } from 'react-native';
import PropTypes from 'prop-types';
import { BehaviorCard } from '../BehaviorCard';

export class PastBehaviorTracker extends Component {
  increaseOccurrence(behavior) {
    const value = { ...this.props.value }
    if (value[behavior]) {
      value[behavior] = [ ...value[behavior] ]
    } else {
      value[behavior] = []
    }

    value[behavior].push({
      time: 0,
      distress: 0,
      impairment: 0
    })

    this.props.onChange(value)
  }

  decreaseOccurrence(behavior) {
    const value = { ...this.props.value };

    if (value[behavior] && value[behavior].length) {
      value[behavior] = [...value[behavior]];
      value[behavior].pop();

      this.props.onChange(value);
    }
  }

  render () {
    const {
      config: {
        positiveBehaviors,
        negativeBehaviors
      },
      value = {},
    } = this.props;

    const behaviors = [];
    for (const behavior of positiveBehaviors) {
      behaviors.push({
        ...behavior,
        type: 'positive'
      })
    }

    for (const behavior of negativeBehaviors) {
      behaviors.push({
        ...behavior,
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
                behaviorType={behavior.type}
                onPress={() => this.increaseOccurrence(behavior.name)}
                onLongPress={() => this.decreaseOccurrence(behavior.name)}
                onTimesMenu={() => {
                }}
              />
            ))
          }
        </View>
      </KeyboardAvoidingView>
    )
  }
}

PastBehaviorTracker.propTypes = {
  config: PropTypes.object,
  onChange: PropTypes.func,
  value: PropTypes.any
}
