import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ScrollView, StyleSheet } from 'react-native';
import { Text, Button } from 'native-base';
import i18n from 'i18next';
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
          ${i18n.t('join_invite:click_below')}
          `}
        </Text>
        <FunButton onPress={onAccept}>Join Now</FunButton>
        <Text style={{ color: colors.tertiary, textAlign: 'justify', paddingTop: 20 }}>
          {`
          ${i18n.t('join_invite:decline')}

          `}
        </Text>
        <Button rounded full danger onPress={onDecline} style={{ borderRadius: 50 }} bordered>
          <Text style={{ fontWeight: 'bold' }}>{i18n.t('join_invite:decline_title')}</Text>
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
