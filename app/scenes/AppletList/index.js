import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Actions } from 'react-native-router-flux';
import {
  appletsSelector,
  isDownloadingAppletsSelector,
} from '../../state/applets/applets.selectors';
import AppletListComponent from './AppletListComponent';
import { sync } from '../../state/app/app.thunks';
import { setCurrentApplet, toggleMobileDataAllowed } from '../../state/app/app.actions';
import { skinSelector, mobileDataAllowedSelector } from '../../state/app/app.selectors';

class AppletList extends Component {
  refresh = () => {
    const { sync } = this.props;
    sync();
  }

  handlePressApplet = (applet) => {
    const { setCurrentApplet } = this.props;
    setCurrentApplet(applet.id);
    Actions.push('applet_details');
  }

  render() {
    const {
      applets,
      isDownloadingApplets,
      skin,
      mobileDataAllowed,
      toggleMobileDataAllowed,
    } = this.props;
    return (
      <AppletListComponent
        applets={applets}
        isDownloadingApplets={isDownloadingApplets}
        title={skin.name}
        primaryColor={skin.colors.primary}
        onPressDrawer={Actions.drawerOpen}
        onPressRefresh={this.refresh}
        onPressApplet={this.handlePressApplet}
        mobileDataAllowed={mobileDataAllowed}
        toggleMobileDataAllowed={toggleMobileDataAllowed}
      />
    );
  }
}

AppletList.propTypes = {
  applets: PropTypes.array.isRequired,
  isDownloadingApplets: PropTypes.bool.isRequired,
  sync: PropTypes.func.isRequired,
  setCurrentApplet: PropTypes.func.isRequired,
  skin: PropTypes.object.isRequired,
  mobileDataAllowed: PropTypes.bool.isRequired,
  toggleMobileDataAllowed: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  applets: appletsSelector(state),
  isDownloadingApplets: isDownloadingAppletsSelector(state),
  skin: skinSelector(state),
  mobileDataAllowed: mobileDataAllowedSelector(state),
});

const mapDispatchToProps = {
  sync,
  setCurrentApplet,
  toggleMobileDataAllowed,
};

export default connect(mapStateToProps, mapDispatchToProps)(AppletList);
