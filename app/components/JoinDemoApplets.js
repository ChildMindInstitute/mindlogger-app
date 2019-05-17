import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { BodyText, Hyperlink } from './core';
import { joinExampleApplet } from '../state/applets/applets.thunks';
import { appletsSelector } from '../state/applets/applets.selectors';

const styles = StyleSheet.create({
  container: {
    padding: 50,
  },
  message: {
    fontSize: 18,
  },
  link: {
    marginTop: 12,
    fontSize: 18,
  },
});

const appletsInclude = (applets, appletSchemaURI) => {
  const appletIndex = applets.find(applet => applet.schema === appletSchemaURI);
  return typeof appletIndex !== 'undefined';
};

const JoinDemoApplets = ({ applets, joinOpenApplet }) => {
  const [joinInProgress, setJoinInProgress] = useState({});
  const appletSchemaURIs = [
    'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activity-sets/ema-hbn/ema-hbn_schema.jsonld',
    'https://github.com/ReproNim/schema-standardization/blob/master/activity-sets/cognitive-tasks/cognitive-tasks_schema.jsonld',
  ];
  const unjoined = appletSchemaURIs.filter(
    appletSchemaURI => !appletsInclude(applets, appletSchemaURI),
  );

  if (unjoined.length === 0) {
    return undefined;
  }

  return (
    <View style={styles.container}>
      <BodyText style={styles.message}>
        Join open studies:
      </BodyText>
      {unjoined.map(appletSchemaURI => (
        <Hyperlink
          onPress={() => {
            joinOpenApplet(appletSchemaURI);
            setJoinInProgress({ ...joinInProgress, [appletSchemaURI]: true });
          }}
          disabled={joinInProgress[appletSchemaURI] === true}
        />
      ))}
    </View>
  );
};

JoinDemoApplets.propTypes = {
  applets: PropTypes.arrayOf(PropTypes.shape({
    schema: PropTypes.string,
  })).isRequired,
  joinOpenApplet: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  applets: appletsSelector(state),
});

const mapDispatchToProps = {
  joinExampleApplet,
};

export default connect(mapStateToProps, mapDispatchToProps)(JoinDemoApplets);
