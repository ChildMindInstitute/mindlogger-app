import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, StatusBar, Text, View, FlatList } from 'react-native';

import { VictoryBar, VictoryChart, VictoryLabel } from 'victory-native';
import { colors } from '../../themes/colors';
import ItemChart from './ItemChart';

const data = [
  { x: '?', y: 1 },
  { x: '??', y: 2 },
  { x: '???', y: 3 },
];

// eslint-disable-next-line
class ActivityChart extends React.Component {

  renderItems() {
    const { activity } = this.props;
    return activity.items.map(item => <ItemChart item={item} key={item.altLabel.en} />);
  }

  render() {
    const { activity } = this.props;
    console.log('activity items', activity.items);
    const itemTypesToIgnore = [
      'markdown-message',
      'audioRecord',
      'audioStimulus',
      '',
    ];
    const itemsFiltered = activity.items.filter(i => itemTypesToIgnore
      .indexOf(i.inputType) < 0 && i.inputType);
    return (
      <View style={{
        paddingTop: 10,
        marginTop: 10,
        backgroundColor: 'white',
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      >
        <Text style={{ fontSize: 30, fontWeight: '200' }}>
          {activity.name.en}
        </Text>
        <Text style={{ fontSize: 15, color: colors.tertiary, paddingBottom: 20 }}>
          { activity.description.en }
        </Text>
        {/* {this.renderItems()} */}
        <FlatList
          data={itemsFiltered}
          keyExtractor={(item, index) => `${activity.name.en}__${index}`}
          renderItem={({ item }) => <ItemChart item={item} />}
        />
      </View>
    );
  }
}

ActivityChart.propTypes = {
  activity: PropTypes.object.isRequired,
};

export default ActivityChart;
