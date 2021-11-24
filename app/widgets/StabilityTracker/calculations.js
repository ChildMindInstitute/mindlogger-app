export const generateTargetTraj = (
  durationMins,
  cyclesPerMin,
  basisFunc="sin",
  refreshDur=0.033,
  scale=0.1,
  padInSeconds=0
) => {
  const numCycles = cyclesPerMin * durationMins
  const durationSecs = (durationMins * 60) + padInSeconds
  const numPoints = Math.ceil(durationSecs / refreshDur)

  const pi = 3.141592;
  const linSpace = [];

  for (let i = 0; i < numPoints; i++) {
    linSpace.push(2 * pi * numCycles / numPoints * i);
  }

  const func = basisFunc.toLowerCase()
  let targetTraj = [];

  for (const x of linSpace) {
    if (func == "sin") {
      targetTraj.push([Math.sin(x) * scale, 0]);
    }
    else if (func == "cos") {
      targetTraj.push([Math.cos(x) * scale, 0]);
    }
    else if (func == "zeros_1d") {
      targetTraj.push([0, 0]);
    }
    else if (func == "zeros_2d") {
      targetTraj.push([0, 0]);
    }
    else if (func == "circle") {
      targetTraj.push([
        Math.cos(x) * scale,
        Math.sin(x) * scale
      ]);
    }
    else if (func == "gerono")
    {
      targetTraj.push([
        Math.cos(x) * scale,
        Math.sin(2 * x) / 2 * scale
      ])
    }
    else {
      throw new Error(`we don't have the '${basic_func}' basis function available.\n\n`);
    }
  }

  return targetTraj
}

export const computeDistance2 = (p1, p2) => {
  if (!p1 || !p2) return undefined

  const xSquared = (p1[0] - p2[0]) * (p1[0] - p2[0])
  const ySquared = (p1[1] - p2[1]) * (p1[1] - p2[1])

  return xSquared + ySquared
}

export const peturbDistance = (minMax, maxVal=null) => {
  let pMin = minMax, pMax = maxVal;
  if (!maxVal) {
    pMin = minMax / 2 * -1
    pMax = minMax / 2
  }

  const xp = Math.random() * (pMax - pMin) + pMin
  const yp = Math.random() * (pMax - pMin) + pMin

  return [xp, yp]
}

export const computeDxDt = (stimPos, userPos, lambdaVal, center) => {
  const changeRate = [0, 0]
  const deltaX = stimPos[0]-center + (userPos[0]-center)
  const deltaY = stimPos[1]-center + (userPos[1]-center)

  changeRate[0] = lambdaVal * deltaX
  changeRate[1] = lambdaVal * deltaY

  return changeRate
}

export const getNewLambda = (currentLambda, currentTs, lambdaSlope, maxLambda) => {
  const LV = currentLambda + currentTs / 1000 * lambdaSlope;

  if (maxLambda > 0 && LV >= maxLambda) {
    return maxLambda;
  }

  return LV;
}

export const isInCircle = (centerPoint, radius, targetPoint) => {
  if (!targetPoint) return false;

  return computeDistance2(centerPoint, targetPoint) <= radius * radius;
}

export const isInRange = (value, start, end) => {
  return value >= start && value <= end;
}

export const getScoreChange = (bonusMulti, deltaTime) => {
  return bonusMulti * deltaTime / 1000
}

export const getBonusMulti = (stimToTargetDist2, innerStimRadius, outerStimRadius) => {
  if (stimToTargetDist2 < innerStimRadius * innerStimRadius) {
    return 2;
  }

  if (stimToTargetDist2 < outerStimRadius * outerStimRadius) {
    return 1;
  }

  return 0;
}

export const getDiskStatus = (stimPos, targetPos, innerStimRadius, outerStimRadius) => {
  const dist2 = computeDistance2(stimPos, targetPos)
  if (dist2 <= innerStimRadius * innerStimRadius) {
    return 0
  }

  if (dist2 <= outerStimRadius * outerStimRadius) {
    return 1
  }

  return 2
}
