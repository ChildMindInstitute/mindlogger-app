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
  if (answer !== null && typeof answer !== 'undefined') {
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
  const isLast = index === activity.items.length - 1;
  const isSkippable = activity.allowRefuseToAnswer === true || activity.allowDoNotKnow === true;
  const isValid = Screen.isValid(answers[index], activity.items[index]);
  const hasPrevPermission = true; // TO DO

  return (
    <Container>
      <StatusBar barStyle="light-content" />
      <ActHeader title={activity.name.en} onInfo={activity.info && onInfo} />
      {activity.items.length > 1 && <ActProgress index={index} length={activity.items.length} />}
      {activity.items.length > 0
        ? (
          <Screen
            key={`${activity.id}-screen-${index}`}
            screen={activity.items[index]}
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
        actionLabel={getActionLabel(answers[index], activity.items[index])}
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
