import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as R from 'ramda';
import PropTypes from 'prop-types';
import { Actions } from 'react-native-router-flux';
import { openDrawer } from '../../state/drawer/drawer.actions';
import { downloadApplets } from '../../state/applets/applets.actions';
import { startResponse, startUploadQueue } from '../../state/responses/responses.actions';
import {
  activitiesSelector,
  downloadProgressSelector,
  isDownloadingAppletsSelector,
} from '../../state/applets/applets.selectors';
import ActivityListComponent from './ActivityListComponent';
import { inProgressSelector } from '../../state/responses/responses.selectors';

class ActivityList extends Component {
  componentDidMount() {
    this.refresh();
  }

  handleAddActivity = () => {
    console.log('Add activity');
  }

  handlePressRow = (activity) => {
    const { startResponse } = this.props;
    startResponse(activity);
    Actions.push('take_act');
  }

  refresh = () => {
    const { downloadApplets, startUploadQueue } = this.props;
    downloadApplets();
    startUploadQueue();
  }

  render() {
    const {
      isAdmin,
      activities,
      appletsDownloadProgress,
      isDownloadingApplets,
      openDrawer,
      inProgress,
    } = this.props;
    return (
      <ActivityListComponent
        showAdmin={isAdmin}
        activities={activities}
        appletsDownloadProgress={appletsDownloadProgress}
        isDownloadingApplets={isDownloadingApplets}
        inProgress={inProgress}
        onPressDrawer={openDrawer}
        onPressAddActivity={this.handleAddActivity}
        onPressRefresh={this.refresh}
        onPressRow={this.handlePressRow}
      />
    );
  }
}

ActivityList.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  activities: PropTypes.array.isRequired,
  appletsDownloadProgress: PropTypes.object.isRequired,
  isDownloadingApplets: PropTypes.bool.isRequired,
  openDrawer: PropTypes.bool.isRequired,
  inProgress: PropTypes.object.isRequired,
  downloadApplets: PropTypes.func.isRequired,
  startUploadQueue: PropTypes.func.isRequired,
  startResponse: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  activities: activitiesSelector(state),
  isAdmin: R.pathOr(false, ['core', 'self', 'admin'], state),
  appletsDownloadProgress: downloadProgressSelector(state),
  isDownloadingApplets: isDownloadingAppletsSelector(state),
  inProgress: inProgressSelector(state),
});

const mapDispatchToProps = {
  openDrawer,
  downloadApplets,
  startUploadQueue,
  startResponse,
};

export default connect(mapStateToProps, mapDispatchToProps)(ActivityList);
