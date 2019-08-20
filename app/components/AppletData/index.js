import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, StatusBar, Text, View, FlatList } from 'react-native';
import { Heading } from 'native-base';
import { VictoryBar, VictoryChart, VictoryTheme, VictoryAxis, VictoryLabel } from 'victory-native';
import { colors } from '../../themes/colors';
import ActivityChart from './ActivityChart';

const data = [
  { x: '?', y: 1 },
  { x: '??', y: 2 },
  { x: '???', y: 3 },
];

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
    console.log('applet acgs is', applet.activities);
    return (
      <View style={styles.container}>
        <FlatList
          data={applet.activities}
          renderItem={({ item }) => {
            return <ActivityChart activity={item} />;
          }}
          keyExtractor={(item, index) => {
            return `${applet.name.en}__${index}`;
          }}
        />
      </View>
    );
  }
}

AppletData.propTypes = {
  applet: PropTypes.object.isRequired,
};

export default AppletData;
