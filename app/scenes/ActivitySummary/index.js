import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { SafeAreaView, View, FlatList, StyleSheet, Text, Dimensions, StatusBar, ImageBackground } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { colors } from '../../themes/colors';
import {
  BodyText,
  Heading,
} from '../../components/core';
import theme from '../../themes/base-theme';
import FunButton from '../../components/core/FunButton';

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    backgroundColor: 'rgba(202, 202, 202, 0.2)'
  },
  itemContainer: {
    width,
    paddingTop: 20,
    paddingRight: 35,
    paddingLeft: 35,
    paddingBottom: 20,
    marginBottom: 20,
    backgroundColor: 'white',
    alignContent: 'center',
    alignItems: 'flex-start',
    justifyContent: 'center',
  }
});

const DATA = [
  {
    category: 'Suicide',
    message: 'Critical Level: Parent indicated possible bullying. Bring to immediate attention of clinician due to potential emergency situation.',
    score: '2.00',
  },
  {
    category: 'Emotional',
    message: 'Within normal limits: No further screening or assessment required',
    score: '10.00',
  },
  {
    category: 'Sport',
    message: 'Clinical Range: Make clinician aware; Perform follow up assessment (Recommended); Generate referral',
    score: '4.00',
  },
];

const ActivitySummary = () => {
  const onClose = () => {
    console.log('closed');
    Actions.push('activity_thanks');
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <Text style={{ fontSize: 20, fontWeight: '200' }}>
          {item.category}
        </Text>
        <Text
          style={{ fontSize: 22, color: colors.tertiary, paddingBottom: 20 }}
        >
          {item.score}
        </Text>
        <Text style={{ fontSize: 15 }}>
          {item.message}
        </Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={DATA}
        renderItem={renderItem}
        contentContainerStyle={styles.container}
        keyExtractor={item => item.category}
      />
    </>
  );
};

ActivitySummary.propTypes = {
};

const mapDispatchToProps = {
};

export default connect(null, mapDispatchToProps)(ActivitySummary);
