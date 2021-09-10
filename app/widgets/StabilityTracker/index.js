import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, PanResponder } from 'react-native';
import { connect } from 'react-redux';
import Svg, { Circle } from 'react-native-svg';
import { useAnimationFrame } from '../../services/hooks';
import {
  generateTargetTraj,
  computeDxDt,
  peturbDistance,
  isInCircle,
  getNewLambda,
  getScoreChange,
  getDiskStatus,
  computeDistance2,
  getBonusMulti
} from './calculations';

import {
  calibrationResponseSelector,
} from '../../state/responses/responses.selectors';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column'
  }
});

const StabilityTrackerScreen = ({ onChange, config, isCurrent }) => {
  const configObj = {
    maxOffTargetTime: config.maxOffTargetTime || 15,
    numTestTrials: config.numTestTrials || 10,
    taskMode: config.taskMode || 'pseudo_stair',
    trackingDims: config.trackingDims || 2,
    showScore: config.showScore !== false,
    phaseType: config.phaseType || 'calibration',
    lambdaSlope: 1.0 || config.lambdaSlope,
    basisFunc: config.basisFunc || 'gerono',
    noiseLevel: config.noiseLevel || 0,
    taskLoopRate: config.taskLoopRate || 0.0167, // default 60hz
    cyclesPerMin: config.cyclesPerMin || 2,
    showPreview: config.showPreview || true,
    numPreviewStim: config.numPreviewStim || 3,
    previewStepGap: config.previewStepGap || 100,
    initialLambda: config.initialLambda || 0.075,
    durationMins: config.durationMins || 15,
  };

  const [width, setWidth] = useState(0);
  const [moving, setMoving] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [score, setScore] = useState(0);
  const userPos = useRef(null);
  const stimPos = useRef(null);
  const maxLambda = 0;

  const offTargetTimer = useRef(configObj.maxOffTargetTime * 1000);

  const updateCursorPos = (evt) => {
    const { locationX, locationY } = evt.nativeEvent;

    userPos.current = [locationX, locationY]
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        updateCursorPos(evt);
        setMoving(true)
      },
      onPanResponderMove: updateCursorPos,
    })
  ).current;

  const targetPoints = useRef();
  const pointRadius = width/152, outerStimRadius = width / 19, innerStimRadius = width/38, panelRadius = width/2;
  const [tickNumber, setTickNumber] = useState(0);
  const lambdaVal = useRef(configObj.initialLambda);

  /** update score */
  const updateScore = (tickNumber, deltaTime) => {
    const targetPos = targetPoints.current[tickNumber];
    const stimToTargetDist2 = computeDistance2(stimPos.current, targetPos);
    const bonusMulti = getBonusMulti(stimToTargetDist2, innerStimRadius, outerStimRadius);
    const scoreChange = getScoreChange(Math.sqrt(stimToTargetDist2), lambdaVal.current, bonusMulti, panelRadius/2);
    setScore(score => score + scoreChange);

    if (!scoreChange) {
      offTargetTimer.current -= deltaTime;
    }
  }

  /** update models */
  const updateModels = (timeElapsed, tickNumber) => {
    const delta = computeDxDt(stimPos.current, userPos.current, lambdaVal.current, width/2);
    const noise = peturbDistance(width * configObj.noiseLevel);
    const center = width/2;

    stimPos.current = [
      delta[0] + noise[0] + stimPos.current[0],
      delta[1] + noise[1] + stimPos.current[1]
    ]

    const isInBounds = isInCircle([center, center], panelRadius, stimPos.current)
    if (!isInBounds) {
      setMoving(false)
      setScore(score => score * 3 / 4)
      lambdaVal.current = lambdaVal.current / 5
      offTargetTimer.current = configObj.maxOffTargetTime * 1000

      stimPos.current = [center, center]
    } else {
      lambdaVal.current = getNewLambda(lambdaVal.current, timeElapsed / 1000, configObj.lambdaSlope, maxLambda);
    }

    setTickNumber(tickNumber)
    setCurrentTime(timeElapsed)
  }

  /** animation */
  useAnimationFrame(
    (timeElapsed, tickNumber, deltaTime) => {
      updateScore(tickNumber, deltaTime)
      updateModels(timeElapsed, tickNumber)
    },
    configObj.taskLoopRate * 1000,
    moving
  );

  const center = width/2;
  const previews = [];
  let targetPos = null;

  /** get target point and points to preview */
  if (width) {
    const total = targetPoints.current.length;
    for (let i = 0; i < configObj.numPreviewStim; i++) {
      const index = (i + 1) * configObj.previewStepGap + tickNumber;

      if (index < total) {
        previews.push(targetPoints.current[index]);
      }
    }

    targetPos = targetPoints.current[tickNumber];
  }

  const diskStatus = getDiskStatus(stimPos.current, targetPos, [center, center], innerStimRadius, outerStimRadius, panelRadius);
  const stimToCenter = Math.sqrt(computeDistance2(stimPos.current, targetPos));

  return (
    <View
      style={styles.container}
      onLayout={(evt) => {
        /** init width and target points */
        if (!width) {
          const { width, height } = evt.nativeEvent.layout;
          const panelWidth = Math.min(width - 10, height - 110);

          setWidth(panelWidth)
          stimPos.current = [panelWidth/2, panelWidth/2]

          const points = generateTargetTraj(
            configObj.durationMins,
            configObj.cyclesPerMin,
            configObj.basisFunc,
            configObj.taskLoopRate,
            panelWidth/3,
            1
          );

          for (let i = 0; i < points.length; i++) {
            if (Array.isArray(points[i])) { // 2d
              points[i][0] += panelWidth/2;
              points[i][1] += panelWidth/2;
            } else { // 1d
              points[i] += panelWidth/2;
            }
          }

          targetPoints.current = points
        }
      }}
    >
      <Text>Time: { Number(currentTime/1000).toFixed(1) }</Text>
      <Text>OTCD: { Number(offTargetTimer.current / 1000).toFixed(1) }</Text>
      <Text>Score: { Math.round(score) }</Text>
      <Text>Lambda: { Math.round(lambdaVal.current * 1000) }</Text>

      <View
        style={{
          width,
          height: width,
        }}
        {...panResponder.panHandlers}
      >
        <Svg width={width} height={width}>
          <Circle
            cx={center}
            cy={center}
            r={panelRadius}
            fill={diskStatus < 3 ? 'gray' : 'red'}
          />

          {
            stimPos.current && <Circle
              cx={stimPos.current[0]}
              cy={stimPos.current[1]}
              r={outerStimRadius}
              fill={diskStatus == 1 ? 'rgb(177, 156, 135)' : 'blue'}
              stroke='black'
              strokeWidth={1}
            />
          }

          {
            stimPos.current && <Circle
              cx={stimPos.current[0]}
              cy={stimPos.current[1]}
              r={innerStimRadius}
              fill={diskStatus == 0 ? 'rgb(126, 175, 156)' : 'blue'}
              stroke='black'
              strokeWidth={1}
            />
          }

          {
            // print target circle

            targetPos && <Circle
              cx={targetPos[0]}
              cy={targetPos[1]}
              r={pointRadius}
              fill="rgb(19,91,89)"
            />
          }
          {
            configObj.showPreview &&
              previews.map((obj, index) => (
                <Circle
                  key={index}
                  cx={obj[0]}
                  cy={obj[1]}
                  r={pointRadius}
                  fill="white"
                />
              ))
          }
        </Svg>
      </View>

      <Text>Stim to Center: { Number((stimToCenter || 0) / panelRadius).toFixed(3) }</Text>
    </View>
  )
}

StabilityTrackerScreen.propTypes = {
  config: PropTypes.shape({
    maxOffTargetTime: PropTypes.number,
    numTestTrials: PropTypes.number,
    taskMode: PropTypes.string,
    trackingDims: PropTypes.number,
    showScore: PropTypes.bool,
    phaseType: PropTypes.string,
    lambdaSlope: PropTypes.number,
    basisFunc: PropTypes.string,
    noiseLevel: PropTypes.number,
    taskLoopRate: PropTypes.number,
    cyclesPerMin: PropTypes.number,
    showPreview: PropTypes.bool,
    numPreviewStim: PropTypes.number,
    previewStepGap: PropTypes.number,
  }),
  onChange: PropTypes.func.isRequired,
  isCurrent: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  calibrationResponse: calibrationResponseSelector(state),
});

export const StabilityTracker = connect(mapStateToProps)(StabilityTrackerScreen);
