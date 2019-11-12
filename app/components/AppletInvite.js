import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import PropTypes from 'prop-types';
import { BodyText, TouchBox, SubHeading, NotificationDot } from './core';
// import { acceptInvitation } from '../state/applets/applets.thunks';
import { invitesSelector } from '../state/applets/applets.selectors';
import { setCurrentInvite } from '../state/applets/applets.actions';
import theme from '../themes/base-theme';
import AppletImage from './AppletImage';

const styles = StyleSheet.create({
  container: {
    padding: 20,
    position: 'relative',
    fontFamily: theme.fontFamily,
  },
  message: {
    fontSize: 18,
  },
  link: {
    marginTop: 12,
    fontSize: 18,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    fontFamily: theme.fontFamily,
  },
  textBlock: {
    flex: 1,
    marginLeft: 16,
    fontFamily: theme.fontFamily,
  },
});

const AcceptAppletInvite = ({ invites, setCurrentInvite }) => (
  <View style={styles.container}>
    <BodyText style={styles.message}>
      You have new invites:
    </BodyText>
    {invites.map((invite, index) => {
      const applet = invite.applets[0];
      if (applet) {
        const { name, image } = applet;
        if (applet.name && !applet.name.en) {
          applet.name = {
            en: name,
          };
        }

        if (image && !applet.image) {
          applet.image = image;
        }

        return (
          <View key={applet.name.en + index}>
            <TouchBox
              onPress={() => {
                setCurrentInvite(invite);
                Actions.push('invite');
              }}
            >
              <View style={styles.inner}>
                <AppletImage applet={applet} />
                <View style={styles.textBlock}>
                  <SubHeading style={{ fontFamily: theme.fontFamily }}>
                    {applet.name.en}
                  </SubHeading>
                  <BodyText style={{ fontFamily: theme.fontFamily }}>
                    {applet.description}
                  </BodyText>
                </View>

              </View>
            </TouchBox>
            <NotificationDot />
          </View>
        );
      }
    })}
  </View>
);

AcceptAppletInvite.propTypes = {
  // applets: PropTypes.arrayOf(PropTypes.shape({
  //   schema: PropTypes.string,
  // })).isRequired,
  // joinOpenApplet: PropTypes.func.isRequired,
  invites: PropTypes.array.isRequired,
  setCurrentInvite: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  invites: invitesSelector(state),
});

const mapDispatchToProps = {
  // joinOpenApplet,
  // acceptInvitation,
  setCurrentInvite,
};

export default connect(mapStateToProps, mapDispatchToProps)(AcceptAppletInvite);
