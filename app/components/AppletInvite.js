import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { BodyText, Hyperlink } from './core';
// import { joinOpenApplet } from '../state/applets/applets.thunks';
import { invitesSelector } from '../state/applets/applets.selectors';

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

const AcceptAppletInvite = ({ invites }) => 
    // const [joinInProgress, setJoinInProgress] = useState({});

     (
      <View style={styles.container}>
        <BodyText style={styles.message}>
          You have new invites:
        </BodyText>
        {invites.map(invite => (
          <Hyperlink
            key={invite.id}
            style={styles.link}
            onPress={() => {
              console.log(invite);
            }}
            disabled={false}
          >
            {invite.name}
          </Hyperlink>
        ))}
      </View>
    )
  ;

AcceptAppletInvite.propTypes = {
  // applets: PropTypes.arrayOf(PropTypes.shape({
  //   schema: PropTypes.string,
  // })).isRequired,
  // joinOpenApplet: PropTypes.func.isRequired,
  invites: PropTypes.array.isRequired,
};

const mapStateToProps = state => ({
  invites: invitesSelector(state),
});

const mapDispatchToProps = {
  // joinOpenApplet,
};

export default connect(mapStateToProps, mapDispatchToProps)(AcceptAppletInvite);
