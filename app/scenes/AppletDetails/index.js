import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Actions } from 'react-native-router-flux';
import { openDrawer } from '../../state/drawer/drawer.actions';
import { startResponse } from '../../state/responses/responses.thunks';
import { currentAppletSelector } from '../../state/app/app.selectors';
import AppletDetailsComponent from './AppletDetailsComponent';
import { inProgressSelector } from '../../state/responses/responses.selectors';

class AppletDetails extends Component {
  handlePressActivity = (activity) => {
    const { startResponse } = this.props;
    startResponse(activity);
    Actions.push('take_act');
  }

  handleBack = () => {
    Actions.pop();
  }

  render() {
    const {
      currentApplet,
      openDrawer,
      inProgress,
    } = this.props;
    return (
      <AppletDetailsComponent
        applet={currentApplet}
        inProgress={inProgress}
        onPressDrawer={openDrawer}
        onPressActivity={this.handlePressActivity}
        onPressBack={this.handleBack}
      />
    );
  }
}

AppletDetails.propTypes = {
  currentApplet: PropTypes.object.isRequired,
  openDrawer: PropTypes.func.isRequired,
  inProgress: PropTypes.object.isRequired,
  startResponse: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  currentApplet: currentAppletSelector(state),
  inProgress: inProgressSelector(state),
});

const mapDispatchToProps = {
  openDrawer,
  startResponse,
};

export default connect(mapStateToProps, mapDispatchToProps)(AppletDetails);
