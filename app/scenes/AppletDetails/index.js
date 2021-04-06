import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Actions } from "react-native-router-flux";
import * as firebase from "react-native-firebase";
import { getStore } from "../../store";
import {
  currentAppletSelector,
  skinSelector,
  startedTimesSelector,
} from "../../state/app/app.selectors";
import AppletDetailsComponent from "./AppletDetailsComponent";
import {
  inProgressSelector,
  currentAppletResponsesSelector,
} from "../../state/responses/responses.selectors";
import { invitesSelector } from "../../state/applets/applets.selectors";
import { getAppletResponseData } from "../../state/applets/applets.thunks";
import {
  setCurrentActivity,
  setCurrentEvent,
  setCurrentApplet,
  setAppletSelectionDisabled,
  setActivitySelectionDisabled,
} from "../../state/app/app.actions";
import { startResponse } from "../../state/responses/responses.thunks";

class AppletDetails extends Component {
  /**
   * Method called when the activity is tapped.
   *
   * It opens the activity screen.
   *
   * @param {object} activity the activity data object.
   * @returns {void}
   */
  handlePressActivity = (activity) => {
    const { startedTimes } = this.props;

    if (activity.event) {
      this.props.setCurrentEvent(activity.event.id);
    }
    this.props.setActivitySelectionDisabled(true);
    this.props.setCurrentActivity(activity.id);
    this.props.startResponse(activity);
  };

  /**
   * Method called when the activity is pressed for a few seconds.
   *
   * It creates a new test notification for the pressed activity.
   *
   * @param {object} activity the activity data object.
   * @returns {void}
   */
  handleLongPressActivity = async (activity) => {
    if (!__DEV__) {
      return null;
    }

    const settings = { showInForeground: true };
    const notification = new firebase.notifications.Notification(settings)
      .setNotificationId(`${activity.id}-${Math.random()}`)
      .setTitle(activity.name.en)
      .setBody("Test notification")
      // .setSound('default')
      .setData({
        event_id: 1,
        applet_id: this.props.currentApplet.id.split("/").pop(),
        activity_id: activity.id.split("/").pop(),
      });

    notification.android.setChannelId("MindLoggerChannelId");
    notification.android.setPriority(
      firebase.notifications.Android.Priority.High
    );
    notification.android.setAutoCancel(true);

    try {
      await firebase.notifications().displayNotification(notification);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("Failed to display the notification", error);
    }
  };

  handleBack = () => {
    Actions.replace("applet_list");
    this.props.setCurrentApplet(null);
  };

  componentDidMount() {
    this.props.setCurrentActivity(null);
    this.props.setCurrentEvent(null);
    this.props.setAppletSelectionDisabled(false);
  }

  render() {
    const {
      currentApplet,
      inProgress,
      skin,
      hasInvites,
      appletData,
      getAppletResponseData,
      initialTab,
    } = this.props;
    if (!currentApplet) {
      return null;
    }

    return (
      <AppletDetailsComponent
        applet={currentApplet}
        appletData={appletData}
        getAppletResponseData={getAppletResponseData}
        inProgress={inProgress}
        onPressDrawer={Actions.drawerOpen}
        onPressActivity={this.handlePressActivity}
        onLongPressActivity={this.handleLongPressActivity}
        onPressBack={this.handleBack}
        onPressSettings={() => Actions.push("applet_settings")}
        primaryColor={skin.colors.primary}
        hasInvites={hasInvites}
        initialTab={initialTab}
      />
    );
  }
}

AppletDetails.defaultProps = {
  currentApplet: null,
  initialTab: "activity",
};

AppletDetails.propTypes = {
  currentApplet: PropTypes.object,
  inProgress: PropTypes.object.isRequired,
  setCurrentActivity: PropTypes.func.isRequired,
  setCurrentEvent: PropTypes.func.isRequired,
  skin: PropTypes.object.isRequired,
  startedTimes: PropTypes.object.isRequired,
  startResponse: PropTypes.func.isRequired,
  hasInvites: PropTypes.bool.isRequired,
  initialTab: PropTypes.string,
  appletData: PropTypes.object.isRequired,
  getAppletResponseData: PropTypes.func.isRequired,
  setAppletSelectionDisabled: PropTypes.func.isRequired,
  setActivitySelectionDisabled: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  currentApplet: currentAppletSelector(state),
  inProgress: inProgressSelector(state),
  skin: skinSelector(state),
  startedTimes: startedTimesSelector(state),
  hasInvites: invitesSelector(state).length > 0,
  appletData: currentAppletResponsesSelector(state),
  // responsesSelector(state), // appletDataSelector(state) || {},
});

const mapDispatchToProps = {
  setCurrentActivity,
  setCurrentEvent,
  setCurrentApplet,
  startResponse,
  getAppletResponseData,
  setAppletSelectionDisabled,
  setActivitySelectionDisabled,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AppletDetails);
