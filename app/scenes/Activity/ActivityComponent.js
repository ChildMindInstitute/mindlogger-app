import React from 'react';
import * as R from 'ramda';
import PropTypes from 'prop-types';
import { StatusBar, View } from 'react-native';
import { Container } from 'native-base';
import ActHeader from '../../components/header';
import ActProgress from '../../components/progress';
import ActivityButtons from '../../components/ActivityButtons';
import Screen from '../../components/screen';

const getNextLabel = (isLast, isValid, isSkippable) => {
  if ((isLast && isValid) || (isLast && isSkippable)) {
    return 'Done';
  }
  if (isValid) {
    return 'Next';
  }
  if (isSkippable) {
    return 'Skip';
  }
  return null;
};

const getPrevLabel = (isFirst, hasPrevPermission) => {
  if (isFirst) {
    return 'Return';
  }
  if (hasPrevPermission) {
    return 'Back';
  }
  return null;
};

const getActionLabel = (answer, screen) => {
  const canvasType = R.path(['meta', 'canvasType'], screen);
  const canvasMode = R.path(['meta', 'canvas', 'mode'], screen);
  if (answer) {
    return 'Undo';
  }
  if (canvasType === 'draw' && canvasMode === 'camera') {
    return 'Take';
  }
  return null;
};

const ActivityComponent = ({
  activity,
  answers,
  authToken,
  index,
  screenRef,
  onInfo,
  onNext,
  onPrev,
  onUndo,
  onAnswer,
}) => {
  // Return early if there is no activity, e.g. if it has been removed
  if (!activity) {
    return null;
  }

  // Calculate some stuff about the current answer state
  const displayProgress = R.path(['meta', 'display', 'progress'], activity);
  const isLast = index === activity.screens.length - 1;
  const isSkippable = R.pathOr(false, ['screens', index, 'meta', 'skippable'], activity);
  const isValid = Screen.isValid(answers[index], activity.screens[index]);
  const hasPrevPermission = R.pathOr(false, ['meta', 'permission', 'prev'], activity);

  return (
    <Container>
      <StatusBar barStyle="light-content" />
      <ActHeader title={activity.name} onInfo={activity.info && onInfo} />
      {displayProgress && <ActProgress index={index} length={activity.screens.length} />}
      {activity.screens.length > 0
        ? (
          <Screen
            key={`${activity._id}-screen-${index}`}
            screen={activity.screens[index]}
            answer={answers[index]}
            onChange={(answer) => { onAnswer(answer, index); }}
            authToken={authToken}
            ref={screenRef}
          />
        )
        : <View style={{ flex: 1 }} />
      }
      <ActivityButtons
        nextLabel={getNextLabel(isLast, isValid, isSkippable)}
        onPressNext={isValid || isSkippable ? onNext : undefined}
        prevLabel={getPrevLabel(index === 0, hasPrevPermission)}
        onPressPrev={onPrev}
        actionLabel={getActionLabel(answers[index], activity.screens[index])}
        onPressAction={onUndo}
      />
    </Container>
  );
};

ActivityComponent.defaultProps = {
  activity: undefined,
};

ActivityComponent.propTypes = {
  activity: PropTypes.object,
  answers: PropTypes.array.isRequired,
  authToken: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  screenRef: PropTypes.object.isRequired,
  onInfo: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrev: PropTypes.func.isRequired,
  onUndo: PropTypes.func.isRequired,
  onAnswer: PropTypes.func.isRequired,
};

export default ActivityComponent;
