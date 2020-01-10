import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ScrollView, StyleSheet } from 'react-native';
import { Markdown } from '../../components/core/Markdown';
import { SubHeading } from '../../components/core/SubHeading';
import AboutIcon from '../../components/Icons/About';
import { colors } from '../../themes/colors';

const styles = StyleSheet.create({
  main: {
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    padding: 10,
  },
});

// eslint-disable-next-line
class AboutInvite extends Component {

  render() {
    const { inviteInfo } = this.props;
    const { applets } = inviteInfo;
    const applet = applets[0];
    return (
      <ScrollView contentContainerStyle={styles.main}>
        <AboutIcon color={colors.primary} width="100" height="100" />
        <SubHeading>About the study</SubHeading>
        <Markdown>
          {applet.description}
        </Markdown>
      </ScrollView>
    );
  }
}

AboutInvite.propTypes = {
  inviteInfo: PropTypes.object.isRequired,
};

export default AboutInvite;
