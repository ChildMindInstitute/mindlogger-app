import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, FlatList } from 'react-native';
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

  renderItem = ({ item }) => {
    const { appletData } = this.props;
    return <ActivityChart activity={item} appletData={appletData} />;
  };

  render() {
    const { applet } = this.props;
    return (
      <FlatList
        contentContainerStyle={styles.container}
        data={applet.activities}
        renderItem={this.renderItem}
        keyExtractor={(item, index) => `${applet.name.en}__${index}__${Math.random()}`}
      />
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
