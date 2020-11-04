import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Actions } from 'react-native-router-flux';
import i18n from 'i18next';
import {
  appletsSelector,
  invitesSelector,
  isDownloadingAppletsSelector,
  isDownloadingTargetAppletSelector,
} from '../../state/applets/applets.selectors';
import { userInfoSelector } from '../../state/user/user.selectors';
import AppletListComponent from './AppletListComponent';
import { sync } from '../../state/app/app.thunks';
import {
  setCurrentApplet,
  toggleMobileDataAllowed,
  setAppletSelectionDisabled,
} from '../../state/app/app.actions';
import {
  skinSelector,
  mobileDataAllowedSelector,
  appletSelectionDisabledSelector,
} from '../../state/app/app.selectors';

class AppletList extends Component {
  /**
   * Synchronizes the local data of applet with the backend.
   *
   * @returns {void}
   */
  refresh = () => {
    const { sync } = this.props;

    sync();
  };

  /**
   * Method called when an applet card is pressed
   *
   * Navigates to the list of activities for the selected applet.
   *
   * @param {object} applet the selected applet.
   *
   * @returns {void}
   */
  handlePressApplet = (applet) => {
    this.props.setAppletSelectionDisabled(true);
    this.props.setCurrentApplet(applet.id);

    Actions.push('applet_details');
  };

  /**
   * Method called after this component is appended to the DOM.
   *
   * @returns {void}
   */
  componentDidMount() {
    this.props.setCurrentApplet(null);
    this.props.setAppletSelectionDisabled(false);
  }

  componentDidUpdate() {
    const { user } = this.props;
    if (!user) {
      Actions.replace('login');
    }
  }

  render() {
    const {
      appletSelectionDisabled,
      applets,
      invites,
      isDownloadingApplets,
      isDownloadingTargetApplet,
      skin,
      mobileDataAllowed,
      toggleMobileDataAllowed,
      user,
    } = this.props;

    return (
      <AppletListComponent
        disabled={appletSelectionDisabled}
        applets={applets}
        invites={invites}
        isDownloadingApplets={isDownloadingApplets}
        isDownloadingTargetApplet={isDownloadingTargetApplet}
        title={`${i18n.t('additional:hi')} ${user ? user.firstName : ''}!`}
        primaryColor={skin.colors.primary}
        onPressDrawer={() => Actions.push('settings')}
        onPressRefresh={this.refresh}
        onPressAbout={() => {
          Actions.push('about_app');
        }}
        onPressApplet={this.handlePressApplet}
        mobileDataAllowed={mobileDataAllowed}
        toggleMobileDataAllowed={toggleMobileDataAllowed}
      />
    );
  }
}

AppletList.propTypes = {
  applets: PropTypes.array.isRequired,
  invites: PropTypes.array.isRequired,
  isDownloadingApplets: PropTypes.bool.isRequired,
  isDownloadingTargetApplet: PropTypes.bool.isRequired,
  sync: PropTypes.func.isRequired,
  setCurrentApplet: PropTypes.func.isRequired,
  skin: PropTypes.object.isRequired,
  mobileDataAllowed: PropTypes.bool.isRequired,
  toggleMobileDataAllowed: PropTypes.func.isRequired,
  setAppletSelectionDisabled: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  applets: appletsSelector(state),
  invites: invitesSelector(state),
  isDownloadingApplets: isDownloadingAppletsSelector(state),
  isDownloadingTargetApplet: isDownloadingTargetAppletSelector(state),
  appletSelectionDisabled: appletSelectionDisabledSelector(state),
  skin: skinSelector(state),
  mobileDataAllowed: mobileDataAllowedSelector(state),
  user: userInfoSelector(state),
});

const mapDispatchToProps = {
  sync,
  setCurrentApplet,
  toggleMobileDataAllowed,
  setAppletSelectionDisabled,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AppletList);
