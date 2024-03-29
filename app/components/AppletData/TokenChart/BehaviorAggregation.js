import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import Slider2D from '../../Slider2D';

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
  range: {
    textTransform: 'capitalize',
    color: '#8B8B8B',
    fontSize: 15
  },
  card: {
    width: '98%',
    height: width/4,
    borderRadius: width/16,
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
    fontSize: 15,
  }
})

const BehaviorAggregation = ({ pastTokensLabel, aggregation, applet }) => {
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
      <Text style={styles.range}>{pastTokensLabel}</Text>
      {
        options.map(option => (
          <View style={{
            ...styles.card,
            backgroundColor: option.type == 'positive' ? '#0D426D' : '#50256F',
          }}>
            <View
              style={{
                width: width/4,
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

            <View style={{ flexGrow: 1, flexShrink: 1, height: '100%', justifyContent: 'center' }}>
              <Text style={styles.text}>{option.name}</Text>
              <Text style={[styles.text, { marginTop: 4 }]}>{aggregation[option.itemId] && (aggregation[option.itemId][option.name] || {}).count || 0} times</Text>
            </View>

            <View
              style={{ width: width/4, height: '100%', justifyContent: 'center', alignItems: 'center' }}
            >
              <Slider2D
                borderRadius={5}
                borderColor={'rgba(0,0,0,0)'}
                sliderWidth={width/8}
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
