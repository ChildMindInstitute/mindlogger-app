import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Actions } from 'react-native-router-flux';
import { currentAppletSelector, skinSelector } from '../../state/app/app.selectors';
import AppletDetailsComponent from './AppletDetailsComponent';
import { inProgressSelector } from '../../state/responses/responses.selectors';
import { setCurrentActivity } from '../../state/app/app.actions';
import { startResponse } from '../../state/responses/responses.thunks';

class AppletDetails extends Component {
  handlePressActivity = (activity) => {
    const { setCurrentActivity, startResponse } = this.props;
    setCurrentActivity(activity.id);
    startResponse(activity);
  }

  handleBack = () => {
    Actions.popTo('applet_list'); // pop();
  }

  render() {
    const {
      currentApplet,
      inProgress,
      skin,
    } = this.props;
    if (!currentApplet) {
      return null;
    }

    return (
      <AppletDetailsComponent
        applet={currentApplet}
        inProgress={inProgress}
        onPressDrawer={Actions.drawerOpen}
        onPressActivity={this.handlePressActivity}
        onPressBack={this.handleBack}
        primaryColor={skin.colors.primary}
      />
    );
  }
}

AppletDetails.propTypes = {
  currentApplet: PropTypes.object.isRequired,
  inProgress: PropTypes.object.isRequired,
  setCurrentActivity: PropTypes.func.isRequired,
  skin: PropTypes.object.isRequired,
  startResponse: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  currentApplet: currentAppletSelector(state),
  inProgress: inProgressSelector(state),
  skin: skinSelector(state),
});

const mapDispatchToProps = {
  setCurrentActivity,
  startResponse,
};

export default connect(mapStateToProps, mapDispatchToProps)(AppletDetails);
