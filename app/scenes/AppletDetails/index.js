import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Actions } from 'react-native-router-flux';
import { currentAppletSelector, skinSelector } from '../../state/app/app.selectors';
import AppletDetailsComponent from './AppletDetailsComponent';
import { inProgressSelector, currentAppletResponsesSelector } from '../../state/responses/responses.selectors';
import { appletsSelector, invitesSelector } from '../../state/applets/applets.selectors';
import { getAppletResponseData } from '../../state/applets/applets.thunks';
import { setCurrentActivity, setCurrentApplet } from '../../state/app/app.actions';
import { startResponse } from '../../state/responses/responses.thunks';

class AppletDetails extends Component {
  handlePressActivity = (activity) => {
    const { setCurrentActivity, startResponse } = this.props;
    setCurrentActivity(activity.id);
    startResponse(activity);
  }

  handleBack = () => {
    Actions.replace('applet_list');
  }

  handlePressApplet = (applet) => {
    const { setCurrentApplet } = this.props;
    setCurrentApplet(applet.id);
  }

  render() {
    const {
      currentApplet,
      inProgress,
      skin,
      hasInvites,
      appletData,
      applets,
      getAppletResponseData,
    } = this.props;
    if (!currentApplet) {
      // return null;
      const allActivities = [];
      applets.map(applet => (allActivities.push(...applet.activities)));

      const allApplet = {
        id: 'applet/all',
        groupId: ['5cf190e44c505911181d0728'],
        schema: 'https://raw.githubusercontent.com/hotavocado/HBN_EMA_NIMH/clone1/protocols/EMA_HBN_NIMH/EMA_HBN_NIMH_schema',
        name: { en: 'All Activities' },
        description: { en: 'All my activities' },
        about: undefined,
        schemaVersion: { en: '0.0.1' },
        version: { en: '0.0.1' },
        altLabel: { en: 'EMA_HBN_NIMH_schema' },
        visibility: { day_set: true, evening_set: true, morning_set: true, pre_questionnaire: true },
        image: undefined,
        order: ['https://raw.githubusercontent.com/hotavocado/HBN_E…vities/pre_questionnaire/pre_questionnaire_schema', 'https://raw.githubusercontent.com/hotavocado/HBN_E…/clone1/activities/morning_set/morning_set_schema', 'https://raw.githubusercontent.com/hotavocado/HBN_EMA_NIMH/clone1/activities/day_set/day_set_schema', 'https://raw.githubusercontent.com/hotavocado/HBN_E…/clone1/activities/evening_set/evening_set_schema'],
        schedule: undefined,
        responseDates: [],
        shuffle: false,
        activities: allActivities,
      };

      const allAppletData = {
        responses: {},
        'schema:duration': 'P7D',
        'schema:endDate': '"2020-01-15',
        'schema:startDate': '2020-01-08',
        appletId: 'applet/all',
      };

      return (
        <AppletDetailsComponent
          applets={applets}
          applet={allApplet}
          appletData={allAppletData}
          getAppletResponseData={getAppletResponseData}
          inProgress={inProgress}
          onPressDrawer={Actions.drawerOpen}
          onPressActivity={this.handlePressActivity}
          onPressBack={this.handleBack}
          onPressApplet={this.handlePressApplet}
          onPressSettings={() => Actions.push('applet_settings')}
          primaryColor={skin.colors.primary}
          hasInvites={false}
        />
      );
    }
    return (
      <AppletDetailsComponent
        applets={applets}
        applet={currentApplet}
        appletData={appletData}
        getAppletResponseData={getAppletResponseData}
        inProgress={inProgress}
        onPressDrawer={Actions.drawerOpen}
        onPressActivity={this.handlePressActivity}
        onPressBack={this.handleBack}
        onPressApplet={this.handlePressApplet}
        onPressSettings={() => Actions.push('applet_settings')}
        primaryColor={skin.colors.primary}
        hasInvites={hasInvites}
      />
    );
  }
}

AppletDetails.defaultProps = {
  currentApplet: null,
};

AppletDetails.propTypes = {
  applets: PropTypes.array.isRequired,
  currentApplet: PropTypes.object,
  setCurrentApplet: PropTypes.func.isRequired,
  inProgress: PropTypes.object.isRequired,
  setCurrentActivity: PropTypes.func.isRequired,
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

export default connect(mapStateToProps, mapDispatchToProps)(AppletDetails);
