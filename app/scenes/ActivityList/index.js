import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Actions } from 'react-native-router-flux';
import { openDrawer } from '../../state/drawer/drawer.actions';
import { startResponse } from '../../state/responses/responses.actions';
import {
  activitiesSelector,
  downloadProgressSelector,
  isDownloadingAppletsSelector,
} from '../../state/applets/applets.selectors';
import ActivityListComponent from './ActivityListComponent';
import { inProgressSelector } from '../../state/responses/responses.selectors';
import { sync } from '../../state/app/app.actions';

class ActivityList extends Component {
  handlePressRow = (activity) => {
    const { startResponse } = this.props;
    startResponse(activity);
    Actions.push('take_act');
  }

  refresh = () => {
    const { sync } = this.props;
    sync();
  }

  render() {
    const {
      activities,
      appletsDownloadProgress,
      isDownloadingApplets,
      openDrawer,
      inProgress,
    } = this.props;
    return (
      <ActivityListComponent
        activities={activities}
        appletsDownloadProgress={appletsDownloadProgress}
        isDownloadingApplets={isDownloadingApplets}
        inProgress={inProgress}
        onPressDrawer={openDrawer}
        onPressRefresh={this.refresh}
        onPressRow={this.handlePressRow}
      />
    );
  }
}

ActivityList.propTypes = {
  activities: PropTypes.array.isRequired,
  appletsDownloadProgress: PropTypes.object.isRequired,
  isDownloadingApplets: PropTypes.bool.isRequired,
  openDrawer: PropTypes.func.isRequired,
  inProgress: PropTypes.object.isRequired,
  sync: PropTypes.func.isRequired,
  startResponse: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  activities: activitiesSelector(state),
  appletsDownloadProgress: downloadProgressSelector(state),
  isDownloadingApplets: isDownloadingAppletsSelector(state),
  inProgress: inProgressSelector(state),
});

const mapDispatchToProps = {
  openDrawer,
  sync,
  startResponse,
};

export default connect(mapStateToProps, mapDispatchToProps)(ActivityList);
