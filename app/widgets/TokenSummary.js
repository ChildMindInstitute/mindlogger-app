import React, { useState } from 'react';
import { connect } from "react-redux";
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { currentResponsesSelector } from '../state/responses/responses.selectors';
import { CachedImage } from 'react-native-img-cache';

const coin = require('../../img/coin.png');
const coins = require('../../img/coins.png');
const tokenColor = '#FFBA2D', positiveColor = '#719AB6', negativeColor = '#50256F';

const styles = StyleSheet.create({
  main: {
    backgroundColor: '#535353',
  },
  circle: {
    borderRadius: 4,
    width: 8,
    height: 8,
    marginHorizontal: 2,
    backgroundColor: 'white'
  },
  expandButton: {
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#A19F9F',
    paddingVertical: 6,
    paddingHorizontal: 12
  },
  optionDetails: {
    flexDirection: 'row',
    marginVertical: 8,
    marginHorizontal: 10,
    alignItems: 'center'
  },
  optionImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    position: 'relative'
  },
  optionCount: {
    borderWidth: 2,
    borderColor: '#E5CC8B',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 10 * (Math.sqrt(2) + 2) - 5 * Math.sqrt(2) - 2,
    top: 10 * (Math.sqrt(2) + 2) - 5 * Math.sqrt(2) - 2
  }
});

const TokenSummaryComponent = ({ currentResponse }) => {
  const { activity, responses } = currentResponse;
  const [expanded, setExpanded] = useState(false);

  let timeReward = 0, timeLimit = 0, trackingBehaviors = 0, backgroundTokens = 0;

  const options = [];

  const parseResponse = (response, behavior) => {
    let count = 0, reward = 0;

    if (response && response[behavior.name]) {
      for (const data of response[behavior.name]) {
        count++;
        if (data.time && data.distress !== null & data.impairment !== null) {
          reward++;
        }
      }
    }

    return { count, reward }
  }

  for (let i = 0; i < activity.items.length; i++) {
    const item = activity.items[i];
    const response = (responses[i] || {}).value;

    if (item.inputType == 'futureBehaviorTracker' || item.inputType == 'pastBehaviorTracker') {
      const { negativeBehaviors, positiveBehaviors, timeScreen } = item.valueConstraints;

      if (timeScreen && item.inputType == 'futureBehaviorTracker') {
        const timeIndex = activity.items.findIndex(item => item.variableName == timeScreen);
        const timeResponse = (responses[timeIndex] || {}).value;

        timeReward = timeResponse ? timeResponse / 5 : 5;
        timeLimit = timeResponse || 0;
      }

      for (const behavior of positiveBehaviors) {
        options.push({
          ...behavior,
          type: 'positive',
          ...parseResponse(response, behavior)
        })
      }

      for (const behavior of negativeBehaviors) {
        options.push({
          ...behavior,
          type: 'negative',
          ...parseResponse(response, behavior)
        })
      }
    }
  }

  for (const option of options) {
    if (option.type == 'positive') {
      trackingBehaviors += option.value * option.count;
      backgroundTokens += option.reward;
    }
  }

  if (!timeReward) {
    timeReward = 2;
  }

  return (
    <View>
      <View style={[styles.main, { borderRadius: expanded ? 0 : 10 }]}>
        <Text
          style={{
            textAlign: 'center',
            color: 'white',
            fontSize: 18,
            marginVertical: 5
          }}
        >You've earned</Text>

        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
          <Image
            source={coins}
            style={{
              width: 50,
              height: 50
            }}
          />

          <Text
            style={{
              fontSize: 40,
              color: tokenColor,
              marginLeft: 5
            }}
          >{timeReward + backgroundTokens + trackingBehaviors}</Text>
        </View>

        <Text
          style={{
            textAlign: 'center',
            fontSize: 18,
            color: 'white',
            marginVertical: 5
          }}
        >from this activity</Text>

        {
          expanded && (
            <View style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image
                  source={coin}
                  style={{
                    width: 20,
                    height: 20
                  }}
                />

                <Text
                  style={{
                    fontSize: 18,
                    color: tokenColor,
                    fontWeight: 'bold',
                    marginLeft: 2
                  }}
                >{trackingBehaviors}</Text>

                <Text
                  style={{
                    color: 'white',
                    marginLeft: 5
                  }}
                >Tracking behaviors</Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image
                  source={coin}
                  style={{
                    width: 20,
                    height: 20
                  }}
                />
                <Text
                  style={{
                    fontSize: 18,
                    color: tokenColor,
                    fontWeight: 'bold',
                    marginLeft: 2
                  }}
                >{backgroundTokens}</Text>
                <Text
                  style={{
                    color: 'white',
                    marginLeft: 5
                  }}
                >Adding background information</Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image
                  source={coin}
                  style={{
                    width: 20,
                    height: 20
                  }}
                />
                <Text
                  style={{
                    fontSize: 18,
                    color: tokenColor,
                    fontWeight: 'bold',
                    marginLeft: 2
                  }}
                >{timeReward}</Text>
                <Text
                  style={{
                    color: 'white',
                    marginLeft: 5
                  }}
                >Completing activity ({timeLimit ? timeLimit + 'mins' : 'recall'})</Text>
              </View>
            </View>
          ) || (
            <TouchableOpacity
              onPress={() => setExpanded(true)}
              style={styles.expandButton}
            >
              <View style={styles.circle} />
              <View style={styles.circle} />
              <View style={styles.circle} />
            </TouchableOpacity>
          )
        }

        {
          expanded && (
            <View
              style={{
                backgroundColor: '#ECECEC',
                paddingVertical: 10
              }}
            >
              {
                options.map(option => {
                  const color = option.type == 'positive' ? positiveColor : negativeColor;

                  return (
                    <View style={styles.optionDetails}>
                      <View
                        style={[styles.optionImage, { backgroundColor: color }]}
                      >
                        {
                          option.image && (
                            <CachedImage
                              source={coin}
                              style={styles.optionImage}
                            />
                          ) || <></>
                        }

                        <View style={[styles.optionCount, { backgroundColor: color }]}>
                          <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{option.value}</Text>
                        </View>
                      </View>
                      <View style={{ width: '40%', paddingHorizontal: 10 }}>
                        <Text style={{ color }}>{option.name}</Text>
                      </View>
                      <View style={{ width: '20%' }}>
                        <Text style={{ color }}>{option.count} times</Text>
                      </View>
                      <View style={{ flexGrow: 1 }}>
                        {
                          option.type == 'negative' && (
                            <Text style={{ color }}>check later</Text>
                          ) || (
                            <Text style={{ color }}>{option.count * option.value} tokens</Text>
                          )
                        }
                      </View>
                    </View>
                  )
                })
              }
            </View>
          ) || <></>
        }
      </View>
    </View>
  )
}


const mapStateToProps = (state) => ({
  currentResponse: currentResponsesSelector(state)
});

export const TokenSummary = connect(mapStateToProps)(TokenSummaryComponent);
