import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { Actions } from 'react-native-router-flux';
import { openDrawer } from '../../state/drawer/drawer.actions';
import { downloadApplets } from '../../state/applets/applets.actions';
import { startResponse } from '../../state/responses/responses.actions';
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
    const { downloadApplets } = this.props;
    downloadApplets();
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

const mapStateToProps = state => ({
  activities: activitiesSelector(state),
  isAdmin: R.path(['core', 'self', 'admin'], state),
  appletsDownloadProgress: downloadProgressSelector(state),
  isDownloadingApplets: isDownloadingAppletsSelector(state),
  inProgress: inProgressSelector(state),
});

const mapDispatchToProps = {
  openDrawer,
  downloadApplets,
  startResponse,
};

export default connect(mapStateToProps, mapDispatchToProps)(ActivityList);
