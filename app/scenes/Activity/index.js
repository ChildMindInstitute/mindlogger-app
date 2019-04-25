import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { setAnswer } from '../../state/responses/responses.actions';
import { completeResponse } from '../../state/responses/responses.thunks';
import { currentActivitySelector, currentResponsesSelector } from '../../state/responses/responses.selectors';
import Screen from '../../components/screen';
import ActivityComponent from './ActivityComponent';
import { authTokenSelector } from '../../state/user/user.selectors';

class Activity extends Component {
  constructor() {
    super();
    this.screenRef = React.createRef();
    this.state = { index: 0 };
  }

  showInfoScreen = () => {
    const { activity } = this.props;
    Actions.push('about_act', { activity: activity.info });
  }

  handleAnswer = (answer, index) => {
    const { setAnswer, activity } = this.props;
    setAnswer(activity.id, index, answer);
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
    const { activity, completeResponse, answers } = this.props;
    const { index } = this.state;
    const item = activity.items[index];
    // const isValid = Screen.isValid(answers[index], screen);
    const isValid = true;

    if (index < activity.items.length - 1) {
      // Not finished activity
      if (!isValid && item.meta.skipToScreen) {
        // Skip to screen
        const skipToScreen = Math.min(activity.screens.length - 1, item.meta.skipToScreen - 1);
        this.setState({ index: skipToScreen });
      } else {
        // Next or Skip
        this.setState({ index: index + 1 });
      }
    } else {
      // Finished activity
      completeResponse(activity, answers);
      Actions.pop();
    }
  }

  undo = () => {
    const { index } = this.state;
    this.screenRef.current.reset();
    this.handleAnswer(undefined, index);
  }

  render() {
    const { activity, answers, authToken } = this.props;
    const { index } = this.state;
    return (
      <ActivityComponent
        activity={activity}
        answers={answers}
        authToken={authToken}
        index={index}
        screenRef={this.screenRef}
        onInfo={this.showInfoScreen}
        onNext={this.next}
        onPrev={this.prev}
        onUndo={this.undo}
        onAnswer={this.handleAnswer}
      />
    );
  }
}

Activity.defaultProps = {
  activity: undefined,
};

Activity.propTypes = {
  activity: PropTypes.object,
  answers: PropTypes.array.isRequired,
  setAnswer: PropTypes.func.isRequired,
  completeResponse: PropTypes.func.isRequired,
  authToken: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  activity: currentActivitySelector(state),
  answers: currentResponsesSelector(state),
  authToken: authTokenSelector(state),
});

const mapDispatchToProps = {
  setAnswer,
  completeResponse,
};

export default connect(mapStateToProps, mapDispatchToProps)(Activity);
