import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Actions } from 'react-native-router-flux';
import { startResponse } from '../../state/responses/responses.thunks';
import { currentActivitySelector } from '../../state/app/app.selectors';
import ActivityDetailsComponent from './ActivityDetailsComponent';
import { responsesSelector } from '../../state/responses/responses.selectors';

class ActivityDetails extends Component {
  handleStartActivity = (activity) => {
    const { startResponse } = this.props;
    startResponse(activity);
    Actions.push('take_act');
  }

  handleBack = () => {
    Actions.pop();
  }

  render() {
    const {
      currentActivity,
      responseHistory,
    } = this.props;
    if (!currentActivity) {
      return null;
    }

    return (
      <ActivityDetailsComponent
        activity={currentActivity}
        responseHistory={responseHistory}
        onPressDrawer={Actions.drawerOpen}
        onPressStart={() => this.handleStartActivity(currentActivity)}
        onPressBack={this.handleBack}
      />
    );
  }
}

ActivityDetails.propTypes = {
  currentActivity: PropTypes.object.isRequired,
  responseHistory: PropTypes.array.isRequired,
  startResponse: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  currentActivity: currentActivitySelector(state),
  responseHistory: responsesSelector(state),
});

const mapDispatchToProps = {
  startResponse,
};

export default connect(mapStateToProps, mapDispatchToProps)(ActivityDetails);
