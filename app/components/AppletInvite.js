import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import PropTypes from 'prop-types';
import { BodyText, TouchBox, SubHeading, NotificationDot } from './core';
// import { acceptInvitation } from '../state/applets/applets.thunks';
import { invitesSelector } from '../state/applets/applets.selectors';
import { setCurrentInvite } from '../state/applets/applets.actions';

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  message: {
    fontSize: 18,
  },
  link: {
    marginTop: 12,
    fontSize: 18,
  },
});

const AcceptAppletInvite = ({ invites, setCurrentInvite }) => (
  <View style={styles.container}>
    <BodyText style={styles.message}>
      You have new invites:
    </BodyText>
    {invites.map(invite => (
      <View key={invite.name}>
        <TouchBox
          onPress={() => {
            setCurrentInvite(invite._id);
            Actions.push('invite');
          }}
        >

          <SubHeading>
            {invite.name.split('Default')[1].split('(')[0]}
          </SubHeading>
        </TouchBox>
        <NotificationDot />

      </View>
    ))}
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
