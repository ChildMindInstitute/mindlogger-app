import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, PanResponder, BackHandler } from 'react-native';
import { connect } from 'react-redux';
import Svg, { Circle, Rect } from 'react-native-svg';
import { magnetometer } from "react-native-sensors";

import { useAnimationFrame } from '../../services/hooks';
import { showToast } from '../../state/app/app.thunks';

import {
  generateTargetTraj,
  computeDxDt,
  peturbDistance,
  isInCircle,
  getNewLambda,
  getScoreChange,
  getDiskStatus,
  computeDistance2,
  getBonusMulti,
  isInRange
} from './calculations';

import {
  challengePhaseLambdaSelector,
} from '../../state/responses/responses.selectors';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column'
  },
  header: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingHorizontal: 10
  },
  times: {
    flex: 1,
    textAlign: 'left',
    transform: [{ rotate: '90deg'}],
  },
  score: {
    flex: 1,
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: 20,
    transform: [{ rotate: '90deg'}]
  },
  lambda: {
    flex: 1,
    textAlign: 'left',
    transform: [{ rotate: '90deg'}]
  },
  stimToCenter: {
    marginTop: 10,
    textAlign: 'right',
    transform: [{ translateY: 80 }, { rotate: '90deg'}]
  }
});

const StabilityTrackerScreen = ({ onChange, config, isCurrent, maxLambda, showToast }) => {
  const configObj = useRef({
    maxOffTargetTime: config.maxOffTargetTime || 15,
    numTestTrials: config.numTestTrials || 10,
    taskMode: config.taskMode || 'pseudo_stair',
    trackingDims: config.trackingDims || 2,
    showScore: config.showScore !== false,
    phaseType: config.phaseType || 'calibration',
    lambdaSlope: config.lambdaSlope || 20.0,
    basisFunc: config.basisFunc || 'gerono',
    noiseLevel: config.noiseLevel || 0,
    taskLoopRate: config.taskLoopRate || 0.0167, // default 60hz
    cyclesPerMin: config.cyclesPerMin || 2,
    showPreview: config.showPreview || true,
    numPreviewStim: config.numPreviewStim,
    previewStepGap: config.previewStepGap || 100,
    initialLambda: config.initialLambda || 0.075,
    durationMins: config.durationMins || 15,
    oobDuration: config.oobDuration || 0.2,
    trialNumber: config.trialNumber,
    dimensionCount: config.dimensionCount || 1,
    userInputType: config.userInputType || 'gyroscope',
    maxRad: config.maxRad || (Math.PI / 6)
  }).current;

  const [width, setWidth] = useState(0);
  const [moving, setMoving] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const score = useRef(0);
  const userPos = useRef(null);
  const stimPos = useRef(null);
  const isOOB = useRef(false);
  const lambdaSlope = useRef(config.lambdaSlope);
  const oobDuration = useRef(0);
  const trialNumber = useRef(0);
  const responses = useRef([]);
  const magnRef = useRef(), baseAcc = useRef();

  const offTargetTimer = useRef(configObj.maxOffTargetTime * 1000), lastCrashTime = useRef(0);
  const lambdaLimit = configObj.phaseType == 'challenge-phase' ? 0 : maxLambda * 0.3;
  const center = width/2;

  const targetPoints = useRef();
  const pointRadius = width/152, outerStimRadius = width / 19, innerStimRadius = width/38, panelRadius = width/2;
  const blockHeight = width/6/2, blockWidth = width / 3;

  const [tickNumber, setTickNumber] = useState(0);
  const lambdaVal = useRef(configObj.initialLambda);

  useEffect(() => {
    if (!isCurrent && moving) {
      setMoving(false)
      isOOB.current = false;
    }
  }, [isCurrent])

  useEffect(() => {
    if (configObj.userInputType == 'gyroscope') {
      if (moving) {
        magnRef.current = magnetometer.subscribe(({ x, y, z }) => {
          let yRot = Math.asin(x / Math.sqrt(x*x + z*z));
          let xRot = Math.asin(y / Math.sqrt(y*y + z*z + x*x));

          if (y < 0) {
            yRot += Math.PI;
          }

          if (!baseAcc.current) {
            baseAcc.current = [xRot, yRot];
          } else {
            const x = center + (yRot - baseAcc.current[1]) / configObj.maxRad * panelRadius;
            const y = center - (xRot - baseAcc.current[0]) / configObj.maxRad * panelRadius;

            userPos.current = [x, y];
          }
        }, (e) => {
          showToast({
            text: e,
            position: 'bottom',
            duration: 2000,
          });

          configObj.userInputType = 'touch'
        })
      } else {
        if (magnRef.current) {
          magnRef.current.unsubscribe();
        }
      }
    }

    return () => {
      if (magnRef.current) {
        magnRef.current.unsubscribe();
      }
    }
  }, [moving])

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        if (configObj.userInputType == 'touch') {
          userPos.current = [
            evt.nativeEvent.locationX,
            evt.nativeEvent.locationY
          ];
        }

        setMoving(true)
      },
      onPanResponderMove: (evt) => {
        if (configObj.userInputType == 'touch') {
          userPos.current = [
            evt.nativeEvent.locationX,
            evt.nativeEvent.locationY
          ];
        }
      },
    })
  ).current;

  const finishResponse = () => {
    setMoving(false)

    isOOB.current = false;

    let maxLambda = 0;
    for (const response of responses.current) {
      if (maxLambda < response.lambda) {
        maxLambda = response.lambda;
      }
    }

    onChange({
      maxLambda,
      value: responses.current,
      phaseType: configObj.phaseType
    });

    // reset values
    trialNumber.current = 0;
    score.current = 0;
    lambdaVal.current = configObj.initialLambda;
    offTargetTimer.current = configObj.maxOffTargetTime * 1000;
    stimPos.current = [center, center]
    lambdaSlope.current = config.lambdaSlope;
    lastCrashTime.current = 0;
  }

  const restartTrial = (timeElapsed) => {
    score.current = score.current * 3 / 4
    lambdaVal.current = lambdaVal.current / 2
    offTargetTimer.current = configObj.maxOffTargetTime * 1000

    stimPos.current = [center, center]

    trialNumber.current = trialNumber.current+1

    if (configObj.phaseType == 'challenge-phase') {
      lambdaSlope.current = lambdaSlope.current / 9 * 10;
    }

    lastCrashTime.current = timeElapsed;

    if (trialNumber.current >= configObj.trialNumber && configObj.trialNumber) {
      finishResponse()
    }
  }

  /** update score */
  const updateScore = (tickNumber, deltaTime) => {
    const targetPos = targetPoints.current[tickNumber];
    const stimToTargetDist2 = computeDistance2(stimPos.current, targetPos);
    const bonusMulti = getBonusMulti(stimToTargetDist2, innerStimRadius, outerStimRadius);
    const scoreChange = getScoreChange(bonusMulti, deltaTime);
    score.current = score.current + scoreChange;

    if (!scoreChange) {
      offTargetTimer.current -= deltaTime;
      if (offTargetTimer.current < 0) {
        oobDuration.current = 0;
        isOOB.current = true;
      }
    }
  }

  /** update models */
  const updateModels = (timeElapsed) => {
    const delta = computeDxDt(stimPos.current, userPos.current, lambdaVal.current, width/2);
    const noise = peturbDistance(width * configObj.noiseLevel);
    const center = width/2;

    stimPos.current = [
      configObj.dimensionCount > 1 ? delta[0] + noise[0] + stimPos.current[0] : center,
      delta[1] + noise[1] + stimPos.current[1]
    ]

    let isInBounds = true;

    if (configObj.dimensionCount == 1) {
      isInBounds = isInRange(stimPos.current[1], blockHeight, width-blockHeight)
    }
    else {
      isInBounds = isInCircle([center, center], panelRadius, stimPos.current)
    }

    if (!isInBounds) {
      oobDuration.current = 0;
      isOOB.current = true;
    } else {
      lambdaVal.current = getNewLambda(lambdaVal.current, (timeElapsed - lastCrashTime.current) / 1000 * configObj.taskLoopRate, lambdaSlope.current, lambdaLimit);
    }
  }

  /** animation */
  useAnimationFrame(
    (timeElapsed, tickNumber, deltaTime) => {
      if (timeElapsed >= configObj.durationMins * 60 * 1000 || tickNumber >= targetPoints.current.length) {
        finishResponse();
        return ;
      }
      if (isOOB.current) {
        oobDuration.current += deltaTime

        if (oobDuration.current > configObj.oobDuration * 1000) {
          oobDuration.current = 0;
          isOOB.current = false;
          restartTrial(timeElapsed);
        }
      } else {
        updateScore(tickNumber, deltaTime)
        updateModels(timeElapsed)
      }

      setTickNumber(tickNumber)
      setCurrentTime(timeElapsed)

      const targetPos = targetPoints.current[tickNumber];

      const response = {
        timestamp: new Date().getTime(),
        stimPos: [
          stimPos.current[0] / panelRadius - 1,
          stimPos.current[1] / panelRadius - 1
        ],
        userPos: [
          userPos.current[0] / panelRadius - 1,
          userPos.current[1] / panelRadius - 1
        ],
        targetPos: [...targetPos],
        lambda: lambdaVal.current,
        score: score.current,
        lambdaSlope: lambdaSlope.current
      };

      if (configObj.dimensionCount == 1) {
        response.stimPos.shift();
        response.userPos.shift();
        response.targetPos.shift();
      }

      responses.current.push(response)
    },
    configObj.taskLoopRate * 1000,
    moving
  );

  const previews = [];
  let targetPos = null;

  /** get target point and points to preview */
  if (width) {
    const total = targetPoints.current.length;
    const xDelta = Math.min(15, width / 2 / configObj.numPreviewStim);
    for (let i = 0; i < configObj.numPreviewStim; i++) {
      const index = (i + 1) * configObj.previewStepGap + tickNumber;

      if (index < total) {
        const pos = [...targetPoints.current[index]];

        if (configObj.dimensionCount == 1) {
          pos[0] = pos[0] - (i + 1) * xDelta;
        }

        previews.push(pos);
      }
    }

    targetPos = targetPoints.current[tickNumber];
  }

  const diskStatus = getDiskStatus(stimPos.current, targetPos, innerStimRadius, outerStimRadius);
  const stimToCenter = Math.sqrt(computeDistance2(stimPos.current, targetPos));

  const getBackColor = (defaultColor) => {
    if (isOOB.current) {
      const timeProgress = oobDuration.current / configObj.oobDuration / 1000 * 4;
      const mixRate = [ timeProgress - Math.floor(timeProgress), Math.floor(timeProgress) + 1 - timeProgress ];
      const colors = [ Math.floor(mixRate[0] * 255), Math.floor(mixRate[1] * 255) ]

      if (Math.floor(timeProgress)%2) {
        return `rgb(${colors[0]}, ${colors[1]}, 0)`
      } else {
        return `rgb(${colors[1]}, ${colors[0]}, 0)`
      }
    }

    return defaultColor
  }

  const initLayout = (evt) => {
    /** init width and target points */
    if (!width) {
      const { width, height } = evt.nativeEvent.layout;
      const panelWidth = Math.min(width - 10, height - 110);

      setWidth(panelWidth)
      stimPos.current = [panelWidth/2, panelWidth/2]
      userPos.current = [
        panelWidth/2,
        panelWidth/2
      ];

      const points = generateTargetTraj(
        configObj.durationMins,
        configObj.cyclesPerMin,
        configObj.basisFunc,
        configObj.taskLoopRate,
        panelWidth/3,
        1
      );

      for (let i = 0; i < points.length; i++) {
        points[i][1] += panelWidth/2;
        if (configObj.dimensionCount == 1) {
          points[i][0] = panelWidth/2;
        } else {
          points[i][0] += panelWidth/2;
        }
      }

      targetPoints.current = points
    }
  }

  return (
    <View
      style={styles.container}
      onLayout={initLayout}
    >
      <View style={styles.header}>
        <Text style={styles.times}>
        </Text>
        <Text style={styles.score}>Score {'\n   '} { Math.round(score.current) }</Text>
        <Text style={styles.lambda}></Text>
      </View>

      <View
        style={{
          width,
          height: width,
        }}
        {...panResponder.panHandlers}
      >
        <Svg width={width} height={width}>
          {
            // 1d
            configObj.dimensionCount == 1 &&
            (
              <>
                <Rect
                  x={0}
                  y={0}
                  width={width}
                  height={width}
                  fill={'rgb(150, 150, 150)'}
                />

                <Rect
                  y={0}
                  x={center - blockWidth/2}
                  height={blockHeight-outerStimRadius}
                  width={blockWidth}
                  fill={getBackColor('green')}
                />

                <Rect
                  y={width-blockHeight+outerStimRadius}
                  x={center - blockWidth/2}
                  height={blockHeight-outerStimRadius}
                  width={blockWidth}
                  fill={getBackColor('green')}
                />
              </>
            )
          }

          {
            // 2d
            configObj.dimensionCount == 2 &&
            <Circle
              cx={center}
              cy={center}
              r={panelRadius}
              fill={getBackColor('gray')}
            />
          }

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
  maxLambda: challengePhaseLambdaSelector(state),
});

const mapDispatchToProps = {
  showToast,
};


export const StabilityTracker = connect(mapStateToProps, mapDispatchToProps)(StabilityTrackerScreen);
