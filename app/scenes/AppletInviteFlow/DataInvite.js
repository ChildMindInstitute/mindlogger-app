import React, { Component } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import R from 'ramda';
// import _ from 'lodash';
import { Text, View } from 'native-base';
import { SubHeading } from '../../components/core/SubHeading';
import DataIcon from '../../components/Icons/Data';
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
class DataInvite extends Component {
  // eslint-disable-next-line
  renderPeople(applet) {
    const allPeople = applet.managers.concat(applet.reviewers);
    const uniquePeople = R.groupBy(p => p.email);
    const groupedPeople = uniquePeople(allPeople);
    const mapper = (person, key) => (
      <View key={key}>
        <Text style={{ color: colors.tertiary }}>
          {person[0].firstName} {person[0].lastName}
        </Text>
      </View>
    );
    const keys = Object.keys(groupedPeople);
    const output = [];
    for (let i = 0; i < keys.length; i += 1) {
      const k = keys[i];
      output.push(mapper(groupedPeople[k]));
    }
    // return uniquePeople(allPeople).map();
    // return null;
    return output;
  }

  render() {
    const { inviteInfo } = this.props;
    const { applets } = inviteInfo;
    const applet = applets[0];
    return (
      <ScrollView contentContainerStyle={styles.main}>
        <DataIcon color={colors.primary} width="100" height="100" />
        <SubHeading>Access to your Data</SubHeading>
        <Text style={{ color: colors.tertiary, textAlign: 'justify' }}>
          {`
We think its important for you to know who has access to your data if you accept this invitation.

The following people will have acccess to your data if you accept this invitation:
`}
        </Text>
        {
          this.renderPeople(applet)
        }
      </ScrollView>
    );
  }
}

DataInvite.propTypes = {
  inviteInfo: PropTypes.object.isRequired,
};

export default DataInvite;
