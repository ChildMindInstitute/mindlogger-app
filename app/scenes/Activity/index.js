import React, { Component } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { setAnswer } from '../../state/responses/responses.actions';
import { completeResponse } from '../../state/responses/responses.thunks';
import { currentResponsesSelector } from '../../state/responses/responses.selectors';
import ActivityComponent from './ActivityComponent';
import { authTokenSelector } from '../../state/user/user.selectors';

class Activity extends Component {
  constructor() {
    super();
    this.state = { index: 0 };
  }

  showInfoScreen = () => {
    const { currentResponse } = this.props;
    Actions.push('about_act', { activity: currentResponse.activity.info });
  }

  handleAnswer = (answer, index) => {
    const { setAnswer, currentResponse } = this.props;
    setAnswer(currentResponse.activity.id, index, answer);
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
    const { currentResponse, completeResponse } = this.props;
    const { index } = this.state;
    const { activity } = currentResponse;
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
      completeResponse(currentResponse);
      Actions.push('activity_thanks');
    }
  }

  undo = () => {
    const { index } = this.state;
    this.handleAnswer(undefined, index);
  }

  render() {
    const { currentResponse, authToken } = this.props;
    if (!currentResponse) {
      return <View />;
    }

    const { activity, responses } = currentResponse;
    const { index } = this.state;
    return (
      <ActivityComponent
        activity={activity}
        answers={responses}
        authToken={authToken}
        index={index}
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
  currentResponse: undefined,
};

Activity.propTypes = {
  currentResponse: PropTypes.object,
  setAnswer: PropTypes.func.isRequired,
  completeResponse: PropTypes.func.isRequired,
  authToken: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  currentResponse: currentResponsesSelector(state),
  authToken: authTokenSelector(state),
});

const mapDispatchToProps = {
  setAnswer,
  completeResponse,
};

export default connect(mapStateToProps, mapDispatchToProps)(Activity);
