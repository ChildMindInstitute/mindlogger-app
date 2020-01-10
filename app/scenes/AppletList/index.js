import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Actions } from 'react-native-router-flux';
import {
  appletsSelector,
  invitesSelector,
  isDownloadingAppletsSelector,
} from '../../state/applets/applets.selectors';
import { userInfoSelector } from '../../state/user/user.selectors';
import AppletListComponent from './AppletListComponent';
import { sync } from '../../state/app/app.thunks';
import { setCurrentApplet, toggleMobileDataAllowed } from '../../state/app/app.actions';
import { skinSelector, mobileDataAllowedSelector } from '../../state/app/app.selectors';
import { ALL_APPLETS_ID } from '../../components/AllApplets';
import { sortAppletsAlphabetically } from '../../services/helper';


class AppletList extends Component {
  refresh = () => {
    const { sync } = this.props;
    sync();
  }

  handlePressApplet = (applet) => {
    const { setCurrentApplet, applets } = this.props;
    if (applet.id === ALL_APPLETS_ID) {
      const sortedApplets = Object.assign([], applets);
      sortAppletsAlphabetically(sortedApplets);
      setCurrentApplet(sortedApplets[0].id);
      Actions.push('applet_tabs');
    } else {
      setCurrentApplet(applet.id);
      Actions.push('applet_details');
    }
  }

  render() {
    const {
      applets,
      invites,
      isDownloadingApplets,
      skin,
      mobileDataAllowed,
      toggleMobileDataAllowed,
      user,
    } = this.props;

    return (
      <AppletListComponent
        applets={applets}
        invites={invites}
        isDownloadingApplets={isDownloadingApplets}
        title={`Hi ${user ? user.firstName : ''}!`}
        primaryColor={skin.colors.primary}
        onPressDrawer={() => Actions.push('settings')}
        onPressRefresh={this.refresh}
        onPressAbout={() => { Actions.push('about_app'); }}
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
  sync: PropTypes.func.isRequired,
  setCurrentApplet: PropTypes.func.isRequired,
  skin: PropTypes.object.isRequired,
  mobileDataAllowed: PropTypes.bool.isRequired,
  toggleMobileDataAllowed: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  applets: appletsSelector(state),
  invites: invitesSelector(state),
  isDownloadingApplets: isDownloadingAppletsSelector(state),
  skin: skinSelector(state),
  mobileDataAllowed: mobileDataAllowedSelector(state),
  user: userInfoSelector(state),
});

const mapDispatchToProps = {
  sync,
  setCurrentApplet,
  toggleMobileDataAllowed,
};

export default connect(mapStateToProps, mapDispatchToProps)(AppletList);
