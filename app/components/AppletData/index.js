import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, ScrollView, FlatList } from 'react-native';
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
    const { applet, appletData } = this.props;
    return (
      <ScrollView contentContainerStyle={styles.container}>
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

};

AppletData.propTypes = {
  applet: PropTypes.object.isRequired,
  appletData: PropTypes.object.isRequired,
};

export default AppletData;
