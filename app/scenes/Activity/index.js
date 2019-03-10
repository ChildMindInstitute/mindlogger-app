import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { StatusBar } from 'react-native';
import { Container } from 'native-base';
import { Actions } from 'react-native-router-flux';
import * as R from 'ramda';
import ActHeader from '../../components/header';
import ActProgress from '../../components/progress';
import ActivityButtons from '../../components/ActivityButtons';
import Screen from '../../components/screen';
import { setAnswer, uploadResponse } from '../../state/responses/responses.actions';
import { currentActivitySelector, currentResponsesSelector } from '../../state/responses/responses.selectors';

const getNextLabel = (isLast, isValid, isSkippable) => {
  if (isLast && isValid) {
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

class Activity extends Component {
  constructor() {
    super();
    this.state = { index: 0 };
  }

  showInfoScreen = () => {
    Actions.push('about_act');
  }

  handleAnswer = (answer, index, isDoneAnswer = false) => {
    const { setAnswer, activity } = this.props;
    setAnswer(activity._id, index, answer);

    // Advance to the next screen if the answer is done
    // if (isDoneAnswer && index < activity.screens.length - 1) {
    //   this.next();
    // }
  }

  prev = () => {
    const { index } = this.state;
    if (index === 0) {
      Actions.pop();
    } else {
      this.setState({
        index: index - 1,
      });
    }
  }

  next = () => {
    const { activity, uploadResponse, answers } = this.props;
    const { index } = this.state;
    if (index < activity.screens.length - 1) {
      this.setState({
        index: index + 1,
      });
    } else {
      // uploadResponse(activity, answers);
      Actions.pop();
    }
  }

  undo = () => {
    const { index } = this.state;
    this.screenRef.reset();
    this.handleAnswer(undefined, index);
  }

  render() {
    const { activity, answers, auth } = this.props;
    const { index } = this.state;
    const displayProgress = R.path(['meta', 'display', 'progress'], activity);

    // Calculate some stuff about the current answer state
    const isLast = index === activity.screens.length - 1;
    const isSkippable = R.pathOr(false, ['screens', index, 'meta', 'skippable'], activity);
    const isValid = typeof answers[index] !== 'undefined';
    const hasPrevPermission = R.pathOr(false, ['meta', 'permission', 'prev'], activity);

    return (
      <Container>
        <StatusBar barStyle="light-content" />
        <ActHeader title={activity.name} onInfo={activity.info && this.showInfoScreen} />
        {displayProgress && <ActProgress index={index} length={activity.screens.length} />}
        <Screen
          key={`${activity._id}-screen-${index}`}
          screen={activity.screens[index]}
          answer={answers[index]}
          onChange={(answer, isDoneAnswer) => { this.handleAnswer(answer, index, isDoneAnswer); }}
          auth={auth}
          ref={(ref) => { this.screenRef = ref; }}
        />
        <ActivityButtons
          nextLabel={getNextLabel(isLast, isValid, isSkippable)}
          onPressNext={isValid || isSkippable ? this.next : undefined}
          prevLabel={getPrevLabel(index === 0, hasPrevPermission)}
          onPressPrev={this.prev}
          actionLabel="Undo"
          onPressAction={this.undo}
        />
      </Container>
    );
  }
}

Activity.propTypes = {
  activity: PropTypes.object.isRequired,
  answers: PropTypes.array.isRequired,
  setAnswer: PropTypes.func.isRequired,
  uploadResponse: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  activity: currentActivitySelector(state),
  answers: currentResponsesSelector(state),
  auth: R.path(['core', 'auth'], state),
});

const mapDispatchToProps = {
  setAnswer,
  uploadResponse,
};

export default connect(mapStateToProps, mapDispatchToProps)(Activity);


/*
getButtonState() {
    const { screen, length, activityConfig } = this.props;
    const data = screen.meta || {};
    const { answer, nextScreen, validated } = this.state;
    const { surveyType, canvasType, textEntry } = data;

    const isFinal = (nextScreen || (this.props.index + 1)) >= length;
    let prevButtonText;
    let actionButtonText;
    let nextButtonText;
    const permission = activityConfig.permission || {};
    const skippable = data.skippable === undefined ? permission.skip : data.skippable;
    const prevable = permission.prev;

    if (!surveyType && !canvasType && !textEntry) {
      prevButtonText = 'Back';
      nextButtonText = isFinal ? 'Done' : 'Next';
    } else {
      if (prevable) prevButtonText = 'Back';
      if (answer) {
        actionButtonText = 'Undo';
        if (validated) nextButtonText = isFinal ? 'Done' : 'Next';
      } else {
        if (canvasType === 'camera') {
          actionButtonText = null;
        } else if (canvasType === 'draw' && data.canvas.mode === 'camera') {
          actionButtonText = 'Take';
        }
        if (skippable) nextButtonText = isFinal ? 'Done' : 'Skip';
      }
    }
    return { prevButtonText, actionButtonText, nextButtonText };
  }

  handleNext = () => {
    const { nextScreen } = this.state;
    this.props.onNext(nextScreen);
  }

  handlePrev = () => {
    this.props.onPrev();
  }

  handleSkip = () => {
    const { screen: { meta: data }, onNext, activityId } = this.props;
    const payload = { '@id': activityId, data: undefined };
    onNext(payload, data.skipToScreen);
  }
  */
