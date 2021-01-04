import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, FlatList, Dimensions, View } from "react-native";
// import { VictoryBar, VictoryChart,
// VictoryTheme, VictoryAxis, VictoryLabel } from 'victory-native';
import moment from "moment";
import ItemChart from "./ItemChart";
import { colors } from "../../themes/colors";
import AppletCalendar from "../AppletCalendar";
import SvgGenerator from "./SvgGenerator";
import BaseText from "../base_text/base_text";
// import ActivityChart from './ActivityChart';

const { width } = Dimensions.get("window");
// const tokenSchema = 'https://raw.githubusercontent.com/ChildMindInstitute/TokenLogger_applet/master/protocols/TokenLogger/TokenLogger_schema';

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: "center",
    alignItems: "center",
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

    console.log({ applet });
    console.log({ appletData });

    const itemTypesToIgnore = [
      "markdown-message",
      "audioRecord",
      "audioStimulus",
      "text",
      "",
    ];
    const data = [];
    const activities = [...applet.activities];
    const appletVersion = Object.values(applet.version)[0];

    /** show deleted activites for one weeek */
    // TODO sometimes no activities property in appletData object
    // crash reproduce
    Object.values(appletData.activities).forEach((activity) => {
      if (
        !activities.some(
          (existing) =>
            existing.id.split("/").pop() === activity.original.activityId
        )
      ) {
        activities.push({
          ...activity,
          id: `activity/${activity.original.activityId}`,
        });
      }
    });

    const activityIDToItemList = {};
    const itemSchemaToVersion = {};
    for (const version in appletData.itemReferences) {
      for (const itemId in appletData.itemReferences[version]) {
        const item = appletData.itemReferences[version][itemId];
        if (!item) {
          /** handle items without changes in the schema across several versions */
          itemSchemaToVersion[itemId] = itemSchemaToVersion[itemId] || [];
          itemSchemaToVersion[itemId].push(version);

          continue;
        }

        const activity = appletData.activities[item.activityId];
        const activityId = `activity/${activity.original.activityId}`;

        activityIDToItemList[activityId] =
          activityIDToItemList[activityId] || [];
        activityIDToItemList[activityId].push({
          version,
          itemId,
        });
      }
    }

    activities.forEach((activity) => {
      const itemsFiltered = activity.items
        .filter(
          (i) => itemTypesToIgnore.indexOf(i.inputType) < 0 && i.inputType
        )
        .map((item) => JSON.parse(JSON.stringify(item)));
      itemsFiltered.forEach((item) => {
        item.schemas = [item.schema];
        item.appletVersions = [appletVersion];

        if (itemSchemaToVersion[item.schema]) {
          item.appletVersions.push(...itemSchemaToVersion[item.schema]);
        }
      });

      /** insert deleted/updated items (merge items with same input type) */
      if (activityIDToItemList[activity.id]) {
        for (const itemData of activityIDToItemList[activity.id]) {
          const oldItem = {
            ...appletData.itemReferences[itemData.version][itemData.itemId],
            appletVersion: itemData.version,
          };

          oldItem.schemas = [itemData.itemId];

          const currentItem = itemsFiltered.find(
            (item) =>
              item.id.split("/").pop() === oldItem.original.screenId &&
              item.inputType === oldItem.inputType
          );

          if (currentItem) {
            if (currentItem.inputType === "radio") {
              currentItem.valueMapping = currentItem.valueMapping || {};
              currentItem.valueMapping[oldItem.appletVersion] = [];

              const options = currentItem.valueConstraints.itemList;

              /** merge two option lists */
              oldItem.valueConstraints.itemList.forEach((oldOption, index) => {
                let newId = options.findIndex(
                  (option) =>
                    Object.values(option.name)[0] ===
                    Object.values(oldOption.name)[0]
                );
                if (newId < 0) {
                  newId = options.length;
                  options.push({
                    name: oldOption.name,
                    value: newId,
                  });
                }

                if (
                  itemData.itemId.endsWith("TokenActivity/items/token_screen")
                ) {
                  /** in case of tokenlogger item */
                  currentItem.valueMapping[oldItem.appletVersion][
                    Object.values(oldOption.name)[0]
                  ] = oldOption.value;
                } else {
                  currentItem.valueMapping[oldItem.appletVersion][
                    Object.values(oldOption.name)[0]
                  ] = oldOption.value;
                }
              });
            } else if (currentItem.inputType == "slider") {
              const currentContraint = currentItem.valueConstraints;
              const oldConstraint = oldItem.valueConstraints;

              const lang =
                (currentContraint.itemList &&
                  Object.keys(currentContraint.itemList[0].name)[0]) ||
                (oldConstraint.itemList &&
                  Object.keys(oldConstraint.itemList[0].name)[0]) ||
                "en";

              /** merge two sliders */
              let currentRange = [0, 0];
              let oldRange = [0, 0];

              if (currentContraint.itemList.length) {
                currentRange = [
                  currentContraint.itemList[0].value,
                  currentContraint.itemList[
                    currentContraint.itemList.length - 1
                  ].value + 1,
                ];
              }

              if (oldConstraint.itemList.length) {
                oldRange = [
                  oldConstraint.itemList[0].value,
                  oldConstraint.itemList[oldConstraint.itemList.length - 1]
                    .value + 1,
                ];
              }

              /** For slider items, we need following to merge old version of item with new version
               *  if user selected value 10 on v0.0.1, but range is updated to [0, 9] on v0.0.2, then we need to show range as [0, 10] to represent old responses
               */
              const range = [
                Math.min(currentRange[0], oldRange[0]),
                Math.max(currentRange[1], oldRange[1]),
              ];

              currentContraint.itemList = [];

              /** generate itemList */
              for (let i = range[0]; i < range[1]; i++) {
                currentContraint.itemList.push({
                  value: i,
                  name: {
                    [lang]: `${i}`,
                  },
                });
              }
            }

            currentItem.appletVersions.push(oldItem.appletVersion);

            currentItem.schemas.push(itemData.itemId);
          } else {
            itemsFiltered.push(oldItem);

            oldItem.id = `screen/${oldItem.original.screenId}`;
            oldItem.appletVersions = [oldItem.appletVersion];

            if (itemData.itemId.endsWith("TokenActivity/items/token_screen")) {
              /** convert string to integer for tokenlogger */
              oldItem.valueMapping = {
                [oldItem.appletVersion]: oldItem.valueConstraints.itemList.reduce(
                  (valueMapping, option) => {
                    valueMapping[Object.values(option.name)[0]] = option.value;
                    return valueMapping;
                  },
                  {}
                ),
              };
            }
          }
        }
      }

      if (activity.original && !itemsFiltered.length) {
        return;
      }

      // const { width } = Dimensions.get('window');
      let count = 0;
      for (
        let dataIndex = 0;
        dataIndex < itemsFiltered.length;
        dataIndex += 1
      ) {
        itemsFiltered[dataIndex].schemas.forEach((schema) => {
          if (!appletData.responses[schema]) {
            return;
          }

          for (let i = 0; i < appletData.responses[schema].length; i += 1) {
            const differenceTime =
              new Date().getTime() -
              moment(appletData.responses[schema][i].date)
                .toDate()
                .getTime();
            const differenceDay = differenceTime / (1000 * 3600 * 24);
            if (differenceDay < 7) {
              count += 1;
              break;
            }
          }
        });
      }

      if (count === 0) {
        data.push({ type: "EmptyActivityChart", activity });
      } else {
        data.push({ type: "ActivityChartHeader", activity });
        data.push(
          ...itemsFiltered.map((item) => {
            const responses = [];
            if (appletData.responses) {
              const schemas = [...new Set(item.schemas)];
              schemas.forEach((schema) => {
                if (appletData.responses[schema]) {
                  responses.push(...appletData.responses[schema]);
                }
              });
            }
            const itemData = [];
            responses.forEach((response) => {
              if (
                !item.appletVersions ||
                !Object.keys(appletData.items).length
              ) {
                itemData.push(response);
              } else {
                if (
                  item.inputType === "radio" &&
                  item.valueMapping &&
                  item.valueMapping[response.version]
                ) {
                  /** handle merged items */
                  if (Array.isArray(response.value)) {
                    itemData.push({
                      ...response,
                      value: response.value.map((value) => {
                        const itemValue =
                          item.valueMapping[response.version][value];
                        return itemValue === "undefined" ? value : itemValue;
                      }),
                    });
                  } else {
                    const itemValue =
                      item.valueMapping[response.version][response.value];
                    itemData.push({
                      ...response,
                      value:
                        itemValue === "undefined" ? response.value : itemValue,
                    });
                  }
                } else {
                  itemData.push(response);
                }
              }
            });

            return {
              type: "ActivityChartItem",
              item: this.doItem(item, itemData),
              data: itemData,
            };
          })
        );
        data.push({ type: "ActivityChartFooter", activity });
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
        "h:mm"
      );

      // we need to assume that if from.hour is > 12, then it was the day before.
      // if not, it can stay as is for the current day.

      if (d.value.from.hour >= 12) {
        from.subtract(1, "days");
      }

      const to = moment(`${d.value.to.hour}:${d.value.to.minute}`, "h:mm");
      dp.value = Math.round(Math.abs(to.diff(from, "hours")));
      return dp;
    });
  }

  getActiveCount = (data) => {
    let activeCount = 0;
    for (let i = 0; i < data.length; i += 1) {
      const mondayTime = moment()
        .subtract(new Date().getDay(), "days")
        .startOf("day")
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
            item.description.en.indexOf(")") + 1,
            item.description.en.length
          )
          .replace(/[**]/gi, "")
      : item.question.en
          .slice(item.question.en.indexOf(")") + 1, item.question.en.length)
          .replace(/[**]/gi, "");

    if (item.inputType === "radio") {
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
    if (item.inputType === "slider") {
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
    if (item.inputType === "timeRange") {
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
          backgroundColor: "white",
          alignContent: "center",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BaseText
          style={{ fontSize: 30, fontWeight: "200" }}
          value={activity.name.en}
        />
        {activity.description && (
          <BaseText
            style={{ fontSize: 15, color: colors.tertiary, paddingBottom: 20 }}
            value={activity.description.en}
          />
        )}
        <BaseText style={{ padding: 20 }} textKey="applet_data:title" />
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
          backgroundColor: "white",
          alignSelf: "stretch",
          alignContent: "center",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BaseText
          style={{ fontSize: 30, fontWeight: "200" }}
          value={activity.name.en}
        />
        {activity.description && (
          <BaseText
            style={{ fontSize: 15, color: colors.tertiary, paddingBottom: 0 }}
            value={activity.description.en}
          />
        )}
      </View>
    );
  };

  renderActivityChartItem = ({ item, data }, type) => {
    const dataObj = data;
    const { appletData } = this.props;
    const cumulative = appletData.cumulatives && 
                        appletData.cumulatives[item.schema] && 
                        appletData.cumulatives[item.schema].value 
                      || 0;

    if (type === "TokenLogger") {
      data.forEach((itemData, itemIndex) => {
        if (Array.isArray(itemData.value)) {
          const newData = [];
          itemData.value.forEach((valueData) => {
            item.valueConstraints.itemList.forEach((option) => {
              if (option.name.en === valueData) {
                newData.push(option.value);
              }
            });
          });
          if (newData.length) {
            dataObj[itemIndex].value = newData;
          }
        } else {
          let newValue = itemData.value;
          item.valueConstraints.itemList.forEach((option) => {
            if (option.name.en === newValue) {
              newValue = option.value;
            }
          });
          dataObj[itemIndex].value = newValue;
        }
      });
    }
    return (
      <View
        style={{
          width,
          backgroundColor: "white",
          alignSelf: "stretch",
          alignContent: "center",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ItemChart item={item} data={dataObj} type={type} cumulative={cumulative} />
      </View>
    );
  };

  renderItem = ({ item, index }) => {
    const { applet } = this.props;

    if (item.type === "EmptyActivityChart") {
      const { activity } = item;
      return this.renderEmptyActivityChart(activity, index);
    }
    if (item.type === "ActivityChartHeader") {
      const { activity } = item;
      return this.renderActivityChartHeader(activity, index);
    }
    if (item.type === "ActivityChartItem") {
      const { valueType } = item.item.valueConstraints;
      const type =
        valueType && valueType.includes("token") ? "TokenLogger" : "";
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

AppletData.defaultProps = {};

AppletData.propTypes = {
  applet: PropTypes.object.isRequired,
  appletData: PropTypes.object.isRequired,
  responseDates: PropTypes.array.isRequired,
};

export default AppletData;
