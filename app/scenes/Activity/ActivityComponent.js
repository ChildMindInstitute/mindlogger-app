import React from 'react';
import * as R from 'ramda';
import PropTypes from 'prop-types';
import { StatusBar, View } from 'react-native';
import { Container } from 'native-base';
import ActHeader from '../../components/header';
import ActProgress from '../../components/progress';
import ActivityButtons from '../../components/ActivityButtons';
import Screen from '../../components/screen';
import ActivityScreens from '../../components/ActivityScreens';

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

  // Hide the header and footer if it's a flanker task
  const inputType = R.path(['items', index, 'inputType'], activity);
  const fullScreen = inputType === 'flanker-task';

  return (
    <Container>
      <StatusBar barStyle="light-content" />
      {!fullScreen && <ActHeader title={activity.name.en} onInfo={activity.info && onInfo} />}
      {activity.items.length > 0
        ? (
          <ActivityScreens
            activity={activity}
            answers={answers}
            currentScreen={index}
            onChange={(answer) => { onAnswer(answer, index); }}
            autoIncrement={onNext}
            authToken={authToken}
          />
        )
        : <View style={{ flex: 1 }} />
      }
      {!fullScreen && (
        <View style={{
          backgroundColor: 'white',
          shadowOpacity: 0.75,
          shadowRadius: 5,
          shadowColor: 'lightgray',
          shadowOffset: { height: 0, width: 0 },
        }}>
          {activity.items.length > 1 && <ActProgress index={index} length={activity.items.length} />}
          <ActivityButtons
            nextLabel={getNextLabel(isLast, isValid, isSkippable)}
            onPressNext={isValid || isSkippable ? onNext : undefined}
            prevLabel={getPrevLabel(index === 0, hasPrevPermission)}
            onPressPrev={onPrev}
            actionLabel={getActionLabel(answers[index], activity.items[index])}
            onPressAction={onUndo}
          />
        </View>
      )}
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
  onInfo: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrev: PropTypes.func.isRequired,
  onUndo: PropTypes.func.isRequired,
  onAnswer: PropTypes.func.isRequired,
};

export default ActivityComponent;
