import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import i18n from 'i18next';
import { BodyText, Hyperlink } from './core';
import { joinOpenApplet } from '../state/applets/applets.thunks';
import { appletsSelector } from '../state/applets/applets.selectors';

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

const DEMO_APPLETS = [
  {
    label: i18n.t('join_demo_applets:healthy_brain_network'),
    uri:
      'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activity-sets/ema-hbn/ema-hbn_schema.jsonld',
  },
  {
    label: i18n.t('join_demo_applets:cognitive_tasks'),
    uri:
      'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activity-sets/cognitive-tasks/cognitive-tasks_schema.jsonld',
  },
  {
    label: i18n.t('join_demo_applets:mind_logger_demos'),
    uri:
      'https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activity-sets/mindlogger-demo/mindlogger-demo_schema.jsonld',
  },
];

const appletsInclude = (applets, appletSchemaURI) => {
  const appletIndex = applets.find(applet => applet.schema === appletSchemaURI);
  return typeof appletIndex !== 'undefined';
};

const JoinDemoApplets = ({ applets, joinOpenApplet }) => {
  const [joinInProgress, setJoinInProgress] = useState({});
  const unjoined = DEMO_APPLETS.filter(demoApplet => !appletsInclude(applets, demoApplet.uri));

  if (unjoined.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BodyText style={styles.message}>Join open studies:</BodyText>
      {unjoined.map(demoApplet => (
        <Hyperlink
          key={demoApplet.uri}
          style={styles.link}
          onPress={() => {
            joinOpenApplet(demoApplet.uri);
            setJoinInProgress({ ...joinInProgress, [demoApplet.uri]: true });
          }}
          disabled={joinInProgress[demoApplet.uri] === true}
        >
          {demoApplet.label}
        </Hyperlink>
      ))}
    </View>
  );
};

JoinDemoApplets.propTypes = {
  applets: PropTypes.arrayOf(
    PropTypes.shape({
      schema: PropTypes.string,
    }),
  ).isRequired,
  joinOpenApplet: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  applets: appletsSelector(state),
});

const mapDispatchToProps = {
  joinOpenApplet,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(JoinDemoApplets);
