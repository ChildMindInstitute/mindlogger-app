import React from 'react';
import { ScrollView, View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import PropTypes from 'prop-types';
import Svg, { Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import AppletImage from '../../components/AppletImage';
import AllApplets, { ALL_APPLETS_ID } from '../../components/AllApplets';
import theme from '../../themes/variables';
import { colors } from '../../themes/colors';
import { sortAppletsAlphabetically } from '../../services/helper';

const size = 64;
const fontSize = 12;
const scaleFactor = 0.93;
const padding = 5;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },

  tab: {
    padding,
    overflow: 'hidden',
    width: size + 2 * padding,
    height: size + 3 * padding + fontSize,
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
});

// eslint-disable-next-line
class TabsView extends React.Component {
  fireOnInitial: false;

  onPress = (applet) => {
    this.props.onPress(applet);
    this.fireOnInitial = true;
  }

  renderTabs(applets, currentApplet, renderBorder) {
    return (
      <React.Fragment>
        {applets.map(applet => (
          <TouchableOpacity onPress={() => this.onPress(applet)} key={applet.id}>
            <View style={[
              styles.tab,
              this.fireOnInitial
                  && currentApplet.id === applet.id
                  && { backgroundColor: colors.lightBlue },
            ]}
            >
              <View style={styles.center}>
                {renderBorder}
                <View style={styles.tabImage}>
                  <AppletImage applet={applet} size={scaleFactor * size} />
                </View>
              </View>
              <Text numberOfLines={1} ellipsizeMode="tail" style={styles.tabTitle}>{applet.name.en}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </React.Fragment>
    );
  }

  render() {
    const { applets, onPress, currentApplet, sortedAlphabetically } = this.props;
    const data = Object.assign([], applets);
    if (sortedAlphabetically) {
      sortAppletsAlphabetically(data);
    }
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
        <ScrollView
          horizontal
          style={styles.container}
        >
          <TouchableOpacity
            onPress={() => {
              onPress({ id: ALL_APPLETS_ID });
            }}
            key="allApplets"
          >
            <View style={[
              styles.tab,
              this.fireOnInitial || { backgroundColor: colors.lightBlue },
            ]}
            >
              <View style={styles.center}>
                {renderBorder}
                <View style={styles.tabImage}>
                  <AllApplets.AllAppletsIcon size={scaleFactor * size} />
                </View>
              </View>
              <Text numberOfLines={1} ellipsizeMode="tail" style={styles.tabTitle}>All applets</Text>
            </View>
          </TouchableOpacity>

          {this.renderTabs(data, currentApplet, renderBorder)}

        </ScrollView>
      </React.Fragment>
    );
  }
}


TabsView.propTypes = {
  sortedAlphabetically: PropTypes.bool,
  applets: PropTypes.array.isRequired,
  onPress: PropTypes.func.isRequired,
  currentApplet: PropTypes.object.isRequired,
};
TabsView.defaultProps = {
  sortedAlphabetically: true,
};
export default TabsView;
