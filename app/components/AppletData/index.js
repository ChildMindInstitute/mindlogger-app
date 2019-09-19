import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, ScrollView, FlatList } from 'react-native';
import { Button, Text } from 'native-base';
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

  render() {
    const { applet, refreshData, appletData } = this.props;
    // console.log('applet acts is', applet.activities);
    return (
      <ScrollView contentContainerStyle={styles.container}>
        {/* TODO: refresh on scroll up, like appletListView */}
        <Button onPress={refreshData} style={{ marginLeft: 10 }}>
          <Text>Refresh</Text>
        </Button>
        <FlatList
          data={applet.activities}
          renderItem={({ item }) => <ActivityChart activity={item} appletData={appletData} />}
          keyExtractor={(item, index) => `${applet.name.en}__${index}__${Math.random()}`}
        />
      </ScrollView>
    );
  }
}

AppletData.defaultProps = {
  refreshData() {

  },
};

AppletData.propTypes = {
  applet: PropTypes.object.isRequired,
  appletData: PropTypes.object.isRequired,
  refreshData: PropTypes.func,
};

export default AppletData;
