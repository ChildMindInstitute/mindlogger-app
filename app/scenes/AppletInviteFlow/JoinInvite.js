import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ScrollView, StyleSheet } from 'react-native';
import { Text, Button } from 'native-base';
import { SubHeading } from '../../components/core/SubHeading';
import SurveyIcon from '../../components/Icons/Survey';
import { colors } from '../../themes/colors';
import FunButton from '../../components/core/FunButton';

const styles = StyleSheet.create({
  main: {
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    padding: 10,
  },
});

// eslint-disable-next-line
class JoinInvite extends Component {
  render() {
    const { onAccept, onDecline } = this.props;
    return (
      <ScrollView contentContainerStyle={styles.main}>
        <SurveyIcon color={colors.primary} width="100" height="100" />
        <SubHeading>Join Now</SubHeading>
        <Text style={{ color: colors.tertiary, textAlign: 'justify' }}>
          {`
Click below if you are ready to join this study. You can remove yourself from this study and/or delete your data at any time with no consequences.
          `}
        </Text>
        <FunButton onPress={onAccept}>Join Now</FunButton>
        <Text style={{ color: colors.tertiary, textAlign: 'justify', paddingTop: 20 }}>
          {`
If you do not feel comfortable with sharing your data from this study, you may decline this invitation. 

          `}
        </Text>
        <Button rounded full danger onPress={onDecline} style={{ borderRadius: 50 }} bordered>
          <Text style={{ fontWeight: 'bold' }}>Decline</Text>
        </Button>
      </ScrollView>
    );
  }
}

JoinInvite.propTypes = {
  onAccept: PropTypes.func.isRequired,
  onDecline: PropTypes.func.isRequired,
};

export default JoinInvite;
