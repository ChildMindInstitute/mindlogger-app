import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Actions } from 'react-native-router-flux';
import { currentAppletSelector, skinSelector } from '../../state/app/app.selectors';
import AppletTabsComponent from './AppletTabsComponent';
import {
  inProgressSelector,
  currentAppletResponsesSelector,
} from '../../state/responses/responses.selectors';
import { invitesSelector, appletsSelector } from '../../state/applets/applets.selectors';
import { getAppletResponseData } from '../../state/applets/applets.thunks';
import { setCurrentActivity, setCurrentApplet } from '../../state/app/app.actions';
import { startResponse } from '../../state/responses/responses.thunks';

class AppletTabs extends Component {
  handlePressActivity = (activity) => {
    const { setCurrentActivity, startResponse } = this.props;
    setCurrentActivity(activity.id);
    startResponse(activity);
  };

  handlePressApplet = (applet) => {
    const { setCurrentApplet } = this.props;
    setCurrentApplet(applet.id);
    Actions.replace('applet_tabs');
  };

  handleBack = () => {
    Actions.replace('applet_list');
  };

  render() {
    const {
      applets,
      currentApplet,
      inProgress,
      skin,
      hasInvites,
      appletData,
      getAppletResponseData,
    } = this.props;
    if (!currentApplet) {
      return null;
    }
    // console.log('applet data is', appletData[currentApplet.id.split('/')[1]] || {});
    return (
      <AppletTabsComponent
        applets={applets}
        applet={currentApplet}
        appletData={appletData}
        getAppletResponseData={getAppletResponseData}
        inProgress={inProgress}
        onPressDrawer={Actions.drawerOpen}
        onPressActivity={this.handlePressActivity}
        onPressApplet={this.handlePressApplet}
        onPressBack={this.handleBack}
        onPressSettings={() => Actions.push('applet_settings')}
        primaryColor={skin.colors.primary}
        hasInvites={hasInvites}
      />
    );
  }
}

AppletTabs.defaultProps = {
  currentApplet: null,
};

AppletTabs.propTypes = {
  applets: PropTypes.array.isRequired,
  currentApplet: PropTypes.object,
  inProgress: PropTypes.object.isRequired,
  setCurrentActivity: PropTypes.func.isRequired,
  setCurrentApplet: PropTypes.func.isRequired,
  skin: PropTypes.object.isRequired,
  startResponse: PropTypes.func.isRequired,
  hasInvites: PropTypes.bool.isRequired,
  appletData: PropTypes.object.isRequired,
  getAppletResponseData: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  applets: appletsSelector(state),
  currentApplet: currentAppletSelector(state),
  inProgress: inProgressSelector(state),
  skin: skinSelector(state),
  hasInvites: invitesSelector(state).length > 0,
  appletData: currentAppletResponsesSelector(state),
  // responsesSelector(state), // appletDataSelector(state) || {},
});

const mapDispatchToProps = {
  setCurrentActivity,
  setCurrentApplet,
  startResponse,
  getAppletResponseData,
};

export default connect(mapStateToProps, mapDispatchToProps)(AppletTabs);
