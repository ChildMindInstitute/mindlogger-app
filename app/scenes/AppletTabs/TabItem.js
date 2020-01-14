import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import theme from '../../themes/variables';
import { colors } from '../../themes/colors';
import AppletImage from '../../components/AppletImage';
import { NotificationText } from '../../components/core/NotificationText';
import AllApplets from '../../components/AllApplets';
import { isAllAppletsModel } from './AllAppletsModel';

const size = 64;
const fontSize = 12;
const scaleFactor = 0.93;
const padding = 5;
export const tabHeight = size + 3 * padding + fontSize;

const styles = StyleSheet.create({
  tab: {
    padding,
    overflow: 'hidden',
    width: size + 2 * padding,
    height: tabHeight,
  },

  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  tabImage: {
    overflow: 'hidden',
    width: scaleFactor * size,
    height: scaleFactor * size,
    borderRadius: scaleFactor * size / 2,
  },

  tabTitle: {
    fontFamily: theme.fontFamily,
    fontWeight: 'bold',
    fontSize,
    marginBottom: 5,
    color: colors.tertiary,
    marginTop: padding,
    alignSelf: 'center',
  },
  notification: {
    position: 'absolute',
    top: 0,
    right: 10,
  },
});

const TabItem = ({ applet, onPress, selected }) => {
  const numberOverdue = isAllAppletsModel(applet.id) ? 0 : applet.activities.reduce(
    (accumulator, activity) => (activity.isOverdue ? accumulator + 1 : accumulator),
    0,
  );
  // if (applet.name.en === 'Cognitive Tasks') {
  //   numberOverdue = 1;
  // }
  const renderBorder = (
    <Svg height={size} width={size} style={{ position: 'absolute' }}>
      <Defs>
        <LinearGradient id="grad" x1={size} y1={0} x2={0} y2={size}>
          <Stop offset="0" stopColor="#902F89" stopOpacity="1" />
          <Stop offset="1" stopColor="#EFAF5A" stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#grad)" />
    </Svg>
  );

  return (
    <React.Fragment>
      <TouchableOpacity onPress={() => onPress(applet)} key={applet.id}>
        <View style={[
          styles.tab,
          selected && { backgroundColor: colors.lightBlue },
        ]}
        >
          <View style={styles.center}>
            {renderBorder}
            <View style={styles.tabImage}>
              {isAllAppletsModel(applet.id)
                ? <AllApplets.AllAppletsIcon size={scaleFactor * size} />
                : <AppletImage applet={applet} size={scaleFactor * size} />}
            </View>
          </View>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.tabTitle}
          >{applet.name.en}
          </Text>
          {numberOverdue > 0 && (
            <View style={styles.notification}>
              <NotificationText>{numberOverdue}</NotificationText>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </React.Fragment>
  );
};

TabItem.propTypes = {
  applet: PropTypes.object.isRequired,
  selected: PropTypes.bool,
  onPress: PropTypes.func.isRequired,
};

TabItem.defaultProps = {
  selected: false,
};

export default TabItem;
