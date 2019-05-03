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
import { setCurrentApplet } from '../../state/app/app.actions';

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
    } = this.props;
    return (
      <AppletListComponent
        applets={applets}
        isDownloadingApplets={isDownloadingApplets}
        onPressDrawer={Actions.drawerOpen}
        onPressRefresh={this.refresh}
        onPressApplet={this.handlePressApplet}
      />
    );
  }
}

AppletList.propTypes = {
  applets: PropTypes.array.isRequired,
  isDownloadingApplets: PropTypes.bool.isRequired,
  sync: PropTypes.func.isRequired,
  setCurrentApplet: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  applets: appletsSelector(state),
  isDownloadingApplets: isDownloadingAppletsSelector(state),
});

const mapDispatchToProps = {
  sync,
  setCurrentApplet,
};

export default connect(mapStateToProps, mapDispatchToProps)(AppletList);
