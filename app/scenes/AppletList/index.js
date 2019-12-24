import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Actions } from 'react-native-router-flux';
import {
  appletsSelector,
  invitesSelector,
  isDownloadingAppletsSelector,
  openGroupsSelector,
} from '../../state/applets/applets.selectors';
import { userInfoSelector } from '../../state/user/user.selectors';
import AppletListComponent from './AppletListComponent';
import OpenGroupsModal from './OpenGroupsModal';
import { getOpenGroups, acceptInvitation } from '../../state/applets/applets.thunks';
import { sync } from '../../state/app/app.thunks';
import { setCurrentApplet, toggleMobileDataAllowed } from '../../state/app/app.actions';
import { skinSelector, mobileDataAllowedSelector } from '../../state/app/app.selectors';


class AppletList extends Component {
  state = {
    isModalVisible: false,
  };

  refresh = () => {
    const { sync } = this.props;
    sync();
  };

  handlePressApplet = (applet) => {
    const { setCurrentApplet } = this.props;
    setCurrentApplet(applet.id);
    Actions.push('applet_details');
  };

  handlePressInstallApplets = () => {
    const { getOpenGroups } = this.props;

    getOpenGroups();
    this.toggleModal();
  };

  joinGroups = (groups) => {
    const { acceptInvitation } = this.props;

    groups.map(groupId => acceptInvitation(groupId));
  };

  toggleModal = () => this.setState(({ isModalVisible }) => ({ isModalVisible: !isModalVisible }));

  render() {
    const { isModalVisible } = this.state;
    const {
      applets,
      invites,
      isDownloadingApplets,
      skin,
      mobileDataAllowed,
      toggleMobileDataAllowed,
      user,
      openGroups,
    } = this.props;

    return (
      <>
        <AppletListComponent
          applets={applets}
          invites={invites}
          isDownloadingApplets={isDownloadingApplets}
          title={`Hi ${user ? user.firstName : ''}!`}
          primaryColor={skin.colors.primary}
          onPressDrawer={() => Actions.push('settings')}
          onPressRefresh={this.refresh}
          onPressAbout={() => {
            Actions.push('about_app');
          }}
          onPressApplet={this.handlePressApplet}
          mobileDataAllowed={mobileDataAllowed}
          toggleMobileDataAllowed={toggleMobileDataAllowed}
          handlePressInstallApplets={this.handlePressInstallApplets}
        />
        <OpenGroupsModal
          visible={isModalVisible}
          groups={openGroups}
          joinGroups={this.joinGroups}
          toggleModal={this.toggleModal}
        />
      </>
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
  getOpenGroups: PropTypes.func.isRequired,
  acceptInvitation: PropTypes.func.isRequired,
  openGroups: PropTypes.array.isRequired,
};

const mapStateToProps = state => ({
  applets: appletsSelector(state),
  invites: invitesSelector(state),
  isDownloadingApplets: isDownloadingAppletsSelector(state),
  skin: skinSelector(state),
  mobileDataAllowed: mobileDataAllowedSelector(state),
  user: userInfoSelector(state),
  openGroups: openGroupsSelector(state),
});

const mapDispatchToProps = {
  sync,
  setCurrentApplet,
  toggleMobileDataAllowed,
  getOpenGroups,
  acceptInvitation,
};

export default connect(mapStateToProps, mapDispatchToProps)(AppletList);
