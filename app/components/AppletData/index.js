import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, ScrollView, FlatList } from 'react-native';
// import { Heading } from 'native-base';
// import { VictoryBar, VictoryChart,
// VictoryTheme, VictoryAxis, VictoryLabel } from 'victory-native';
// import { colors } from '../../themes/colors';
import ActivityChart from './ActivityChart';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    // backgroundColor: '#f5fcff'
  },
});

// eslint-disable-next-line
class AppletData extends React.Component {

  renderActivityData() {
    const { applet } = this.props;
    return applet.activities.map(act => <ActivityChart activity={act} key={act.name.en} />);
  }

  render() {
    const { applet } = this.props;
    console.log('applet acts is', applet.activities);
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <FlatList
          data={applet.activities}
          renderItem={({ item }) => <ActivityChart activity={item} />}
          keyExtractor={(item, index) => `${applet.name.en}__${index}`}
        />
      </ScrollView>
    );
  }
}

AppletData.propTypes = {
  applet: PropTypes.object.isRequired,
};

export default AppletData;
