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
    const { onAccept } = this.props;
    return (
      <ScrollView contentContainerStyle={styles.main}>
        <SurveyIcon color={colors.primary} width="100" height="100" />
        <SubHeading>Join Now</SubHeading>
        <Text style={{ color: colors.tertiary, textAlign: 'justify' }}>
          {`
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Fusce dapibus vitae diam ac aliquam.
          `}
        </Text>
        <FunButton onPress={onAccept}>Join Now</FunButton>

      </ScrollView>
    );
  }
}

JoinInvite.propTypes = {
  onAccept: PropTypes.func.isRequired,
};

export default JoinInvite;
