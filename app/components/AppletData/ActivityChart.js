import React from 'react';
import PropTypes from 'prop-types';
import { Text, View, FlatList } from 'react-native';

// import { VictoryBar, VictoryChart, VictoryLabel } from 'victory-native';
import { colors } from '../../themes/colors';
import ItemChart from './ItemChart';

// eslint-disable-next-line no-unused-vars
const data = [
  { x: '?', y: 1 },
  { x: '??', y: 2 },
  { x: '???', y: 3 },
];

// eslint-disable-next-line
class ActivityChart extends React.Component {

  // renderItems() {
  //   const { activity } = this.props;
  //   return activity.items.map(item => <ItemChart item={item} key={item.altLabel.en} />);
  // }

  renderItem = ({ item }) => {
    const { appletData } = this.props;
    return (
      <ItemChart
        item={item}
        data={appletData.responses ? (appletData.responses[item.schema] || []) : []}
      />
    );
  };

  render() {
    const { activity } = this.props;
    // console.log('activity items', activity.items);
    const itemTypesToIgnore = [
      'markdown-message',
      'audioRecord',
      'audioStimulus',
      '',
    ];
    const itemsFiltered = activity.items.filter(i => itemTypesToIgnore
      .indexOf(i.inputType) < 0 && i.inputType);

    // console.log('items filtered', itemsFiltered);

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
        {activity.description && (
          <Text style={{ fontSize: 15, color: colors.tertiary, paddingBottom: 20 }}>
            { activity.description.en }
          </Text>
        )}
        {/* {this.renderItems()} */}
        <FlatList
          data={itemsFiltered}
          keyExtractor={(item, index) => `${activity.name.en}__${index}`}
          renderItem={this.renderItem}
        />
      </View>
    );
  }
}

ActivityChart.propTypes = {
  activity: PropTypes.object.isRequired,
  appletData: PropTypes.object.isRequired,
};

export default ActivityChart;
