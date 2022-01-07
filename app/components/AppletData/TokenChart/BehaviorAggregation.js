import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, Image } from 'react-native';
import Slider2D from '../../Slider2D';

const styles = StyleSheet.create({
  range: {
    color: '#8B8B8B',
    fontSize: 15
  },
  card: {
    width: '95%',
    height: 100,
    borderRadius: 25,
    marginTop: 10,
    position: 'relative',
    flexDirection: 'row'
  },
  image: {
    borderRadius: 40,
    height: 60,
    width: 60
  },
  text: {
    color: '#B7C7D4',
    fontSize: 20
  }
})

const BehaviorAggregation = ({ range, aggregation, applet }) => {
  const options = [];

  for (const activity of applet.activities) {
    for (const item of activity.items) {
      if (item.inputType == 'pastBehaviorTracker' || item.inputType == 'futureBehaviorTracker') {
        const { negativeBehaviors, positiveBehaviors } = item.valueConstraints;
        for (const behavior of negativeBehaviors) {
          options.push({
            itemId: item.id.split('/').pop(),
            type: 'negative',
            ...behavior
          })
        }

        for (const behavior of positiveBehaviors) {
          options.push({
            itemId: item.id.split('/').pop(),
            type: 'positive',
            ...behavior
          })
        }
      }
    }
  }

  const getAverage = (data) => {
    if (!data.count) {
      return 0;
    }

    return Math.round(data.total / data.count)
  }

  return (
    <View style={{
      marginVertical: 20
    }}>
      <Text style={styles.range}>{range}</Text>
      {
        options.map(option => (
          <View style={{
            ...styles.card,
            backgroundColor: option.type == 'positive' ? '#0D426D' : '#50256F',
          }}>
            <View
              style={{
                width: 100,
                alignItems: 'center',
                height: '100%',
                justifyContent: 'center',
                flexGrow: 0
              }}
            >
              {
                option.image ? (
                  <Image
                    style={styles.image}
                    source={{ uri: option.image }}
                  />
                ) : <View style={{ ...styles.image, backgroundColor: '#EFEFEF' }}/>
              }
            </View>

            <View style={{ flexGrow: 1, height: '100%', justifyContent: 'space-around', paddingVertical: 20 }}>
              <Text style={styles.text}>{option.name}</Text>
              <Text style={styles.text}>{aggregation[option.itemId] && (aggregation[option.itemId][option.name] || {}).count || 0} times</Text>
            </View>

            <View style={{ width: 100, height: '100%', padding: 10 }}>
              <Slider2D
                borderRadius={5}
                borderColor={'rgba(0,0,0,0)'}
                sliderWidth={55}
                padding={20}
                item={
                  aggregation[option.itemId] && aggregation[option.itemId][option.name] ? {
                    distress: getAverage(aggregation[option.itemId][option.name].distress),
                    impairment: getAverage(aggregation[option.itemId][option.name].impairment)
                  } : { distress: null, impairment: null }
                }
                type={option.type}
                disabled={true}
                axisHeight={4}
              />
            </View>
          </View>
        ))
      }
    </View>
  )
};

export default BehaviorAggregation;
