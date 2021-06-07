import React from 'react';
import PropTypes from 'prop-types';
import { Dimensions, View, FlatList } from 'react-native';
import moment from 'moment';

import { colors } from '../../themes/colors';
import ItemChart from './ItemChart';
import BaseText from '../base_text/base_text';

// deprecated
// eslint-disable-next-line
class ActivityChart extends React.Component {
  renderItems() {
    const { activity } = this.props;
    return activity.items.map(item => <ItemChart item={item} key={item.altLabel.en} />);
  }

  render() {
    const { activity, appletData } = this.props;
    const itemTypesToIgnore = ['markdownMessage', 'audioRecord', 'audioStimulus', ''];
    const itemsFiltered = activity.items.filter(
      i => itemTypesToIgnore.indexOf(i.inputType) < 0 && i.inputType,
    );

    const { width } = Dimensions.get('window');
    let count = 0;

    for (let dataIndex = 0; dataIndex < itemsFiltered.length; dataIndex += 1) {
      if (!appletData.responses[itemsFiltered[dataIndex].schema]) {
        break;
      }

      for (let i = 0; i < appletData.responses[itemsFiltered[dataIndex].schema].length; i += 1) {
        const differenceTime = new Date().getTime()
          - moment(appletData.responses[itemsFiltered[dataIndex].schema][i].date)
            .toDate()
            .getTime();
        const differenceDay = differenceTime / (1000 * 3600 * 24);
        if (differenceDay < 7) {
          count += 1;
          break;
        }
      }
    }

    if (count === 0) {
      return (
        <View
          style={{
            width,
            paddingTop: 10,
            marginTop: 10,
            backgroundColor: 'white',
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BaseText style={{ fontSize: 30, fontWeight: '200' }} value={activity.name.en} />
          {activity.description && (
            <BaseText
              style={{ fontSize: 15, color: colors.tertiary, paddingBottom: 20 }}
              value={activity.description.en}
            />
          )}
          <BaseText style={{ padding: 20 }} textKey="activity_chart:title" />
        </View>
      );
    }

    return (
      <View
        style={{
          width,
          paddingTop: 10,
          marginTop: 10,
          backgroundColor: 'white',
          alignSelf: 'stretch',
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <BaseText style={{ fontSize: 30, fontWeight: '200' }} value={activity.name.en} />
        {activity.description && (
          <BaseText
            style={{ fontSize: 15, color: colors.tertiary, paddingBottom: 0 }}
            value={activity.description.en}
          />
        )}
        {/* {this.renderItems()} */}
        <FlatList
          data={itemsFiltered}
          keyExtractor={(item, index) => `${activity.name.en}__${index}`}
          renderItem={({ item }) => (
            <ItemChart
              item={item}
              data={appletData.responses ? appletData.responses[item.schema] || [] : []}
            />
          )}
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
