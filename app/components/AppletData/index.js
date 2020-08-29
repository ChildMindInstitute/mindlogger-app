import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, FlatList, Dimensions, Text, View } from 'react-native';
// import { VictoryBar, VictoryChart,
// VictoryTheme, VictoryAxis, VictoryLabel } from 'victory-native';
import moment from 'moment';
import ItemChart from './ItemChart';
import { colors } from '../../themes/colors';
import AppletCalendar from '../AppletCalendar';
import SvgGenerator from './SvgGenerator';
// import ActivityChart from './ActivityChart';

const { width } = Dimensions.get('window');
// const tokenSchema = 'https://raw.githubusercontent.com/ChildMindInstitute/TokenLogger_applet/master/protocols/TokenLogger/TokenLogger_schema';

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    // backgroundColor: '#f5fcff'
  },
});

// eslint-disable-next-line
class AppletData extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: [] };
  }

  componentDidMount() {
    const { applet, appletData } = this.props;
    const itemTypesToIgnore = [
      'markdown-message',
      'audioRecord',
      'audioStimulus',
      'text',
      '',
    ];
    const data = [];
    applet.activities.forEach((activity) => {
      const itemsFiltered = activity.items.filter(
        (i) => itemTypesToIgnore.indexOf(i.inputType) < 0 && i.inputType
      );

      // const { width } = Dimensions.get('window');
      let count = 0;
      for (
        let dataIndex = 0;
        dataIndex < itemsFiltered.length;
        dataIndex += 1
      ) {
        if (!appletData.responses[itemsFiltered[dataIndex].schema]) {
          break;
        }
        for (
          let i = 0;
          i < appletData.responses[itemsFiltered[dataIndex].schema].length;
          i += 1
        ) {
          const differenceTime =
            new Date().getTime() - moment(
              appletData.responses[itemsFiltered[dataIndex].schema][i].date
            )
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
        data.push({ type: 'EmptyActivityChart', activity });
      } else {
        data.push({ type: 'ActivityChartHeader', activity });
        data.push(
          ...itemsFiltered.map((item) => {
            const itemData = appletData.responses
              ? appletData.responses[item.schema] || []
              : [];
            return {
              type: 'ActivityChartItem',
              item: this.doItem(item, itemData),
              data: itemData,
            };
          })
        );
        data.push({ type: 'ActivityChartFooter', activity });
      }
    });
    this.setState({ data });
  }

  // eslint-disable-next-line
  calcTimeDiff(data) {
    // data = {from: {hour: h, minute:mm}, to: {hour:h, minute: mm}}
    return data.map((d) => {
      const dp = {};
      dp.date = d.date;
      const from = moment(
        `${d.value.from.hour}:${d.value.from.minute}`,
        'h:mm'
      );

      // we need to assume that if from.hour is > 12, then it was the day before.
      // if not, it can stay as is for the current day.

      if (d.value.from.hour >= 12) {
        from.subtract(1, 'days');
      }

      const to = moment(`${d.value.to.hour}:${d.value.to.minute}`, 'h:mm');
      dp.value = Math.round(Math.abs(to.diff(from, 'hours')));
      return dp;
    });
  }

  getActiveCount = (data) => {
    let activeCount = 0;
    for (let i = 0; i < data.length; i += 1) {
      const mondayTime = moment()
        .subtract(new Date().getDay() - 1, 'days')
        .startOf('day')
        .toDate();
      const thatTime = moment(data[i].date)
        .toDate()
        .getTime();
      if (mondayTime.getTime() <= thatTime) {
        activeCount += 1;
      }
    }
    return activeCount;
  };

  doItem = (item, data) => {
    const activeCount = this.getActiveCount(data);

    if (activeCount === 0) {
      return { ...item, additionalParams: { activeCount } };
    }
    const description = item.description
      ? item.description.en
          .slice(
            item.description.en.indexOf(')') + 1,
            item.description.en.length
          )
          .replace(/[**]/gi, '')
      : item.question.en
          .slice(item.question.en.indexOf(')') + 1, item.question.en.length)
          .replace(/[**]/gi, '');

    if (item.inputType === 'radio') {
      const labels = item.valueConstraints.itemList.map((i) => ({
        name: i.name.en,
        value: i.value,
      }));
      const timelineChart = SvgGenerator.generateTimelineChart(data, labels);
      return {
        ...item,
        additionalParams: { activeCount, labels, description, timelineChart },
      };
    }
    if (item.inputType === 'slider') {
      const labels = item.valueConstraints.itemList.map((i) => ({
        name: i.name.en,
        value: i.value,
      }));
      const minMaxLabels = [
        item.valueConstraints.minValue,
        item.valueConstraints.maxValue,
      ];
      const lineChart = SvgGenerator.generateLineChart(data, labels);
      return {
        ...item,
        additionalParams: {
          activeCount,
          labels,
          description,
          minMaxLabels,
          lineChart,
        },
      };
    }
    if (item.inputType === 'timeRange') {
      const dataFix = this.calcTimeDiff(data);
      const barChart = SvgGenerator.generateBarChart(dataFix);
      return {
        ...item,
        additionalParams: { activeCount, dataFix, description, barChart },
      };
    }
    return { ...item, additionalParams: { activeCount } };
  };

  // renderItem = ({ item }) => {
  //   const { appletData } = this.props;
  //   return <ActivityChart activity={item} appletData={appletData} />;
  // };

  renderEmptyActivityChart = (activity) => {
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
        <Text style={{ fontSize: 30, fontWeight: '200' }}>
          {activity.name.en}
        </Text>
        {activity.description && (
          <Text
            style={{ fontSize: 15, color: colors.tertiary, paddingBottom: 20 }}
          >
            {activity.description.en}
          </Text>
        )}
        <Text style={{ padding: 20 }}>
          Please take the assessment for data to be displayed.
        </Text>
      </View>
    );
  };

  renderActivityChartHeader = (activity) => {
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
        <Text style={{ fontSize: 30, fontWeight: '200' }}>
          {activity.name.en}
        </Text>
        {activity.description && (
          <Text
            style={{ fontSize: 15, color: colors.tertiary, paddingBottom: 0 }}
          >
            {activity.description.en}
          </Text>
        )}
      </View>
    );
  };

  renderActivityChartItem = ({ item, data }, type) => {
    return (
      <View
        style={{
          width,
          backgroundColor: 'white',
          alignSelf: 'stretch',
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ItemChart item={item} data={data} type={type} />
      </View>
    );
  };

  renderItem = ({ item, index }) => {
    const { applet } = this.props;
    if (item.type === 'EmptyActivityChart') {
      const { activity } = item;
      return this.renderEmptyActivityChart(activity, index);
    }
    if (item.type === 'ActivityChartHeader') {
      const { activity } = item;
      return this.renderActivityChartHeader(activity, index);
    }
    if (item.type === 'ActivityChartItem') {
      const type = applet.schema.includes('TokenLogger') ? 'TokenLogger' : '';
      return this.renderActivityChartItem(item, type);
    }
    return null;
    // return <ActivityChart activity={item} appletData={appletData} />;
  };

  FlatListHeader = () => {
    const { responseDates } = this.props;
    return <AppletCalendar responseDates={responseDates} />;
  };

  render() {
    const { applet } = this.props;
    const { data } = this.state;
    return (
      <>
        <FlatList
          ListHeaderComponent={this.FlatListHeader}
          // removeClippedSubviews // Unmount components when outside of window
          initialNumToRender={5} // Reduce initial render amount
          maxToRenderPerBatch={1} // Reduce number in each render batch
          updateCellsBatchingPeriod={100} // Increase time between renders
          windowSize={3}
          contentContainerStyle={styles.container}
          data={data}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => {
            return `item__${applet.name.en}__${index}__`;
          }}
        />
      </>
    );
  }
}

AppletData.defaultProps = {

};

AppletData.propTypes = {
  applet: PropTypes.object.isRequired,
  appletData: PropTypes.object.isRequired,
  responseDates: PropTypes.array.isRequired,
};

export default AppletData;
