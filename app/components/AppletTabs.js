import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { appletsSelector } from '../state/applets/applets.selectors';
import { currentAppletIdSelector } from '../state/app/app.selectors';
import { colors } from '../themes/colors';
import AppletImage from './AppletImage';
import { setCurrentApplet } from '../state/app/app.actions';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.secondary,
    padding: 2,
  },
  applet: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    padding: 5,
  },
  imageWrapper: {
    borderRadius: 34,
    overflow: 'hidden',
    borderWidth: 2,
    width: 68,
    height: 68,
    borderColor: colors.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  allText: {
    textAlign: 'center',
    fontSize: 40,
    transform: [
      {
        rotate: '180deg',
      },
    ],
    color: colors.black,
  },
  name: {
    fontSize: 12,
  },
});

const AppletTabs = ({ applets, appletId, setCurrentApplet }) => {
  return (
    <ScrollView horizontal style={styles.container}>
      {['all', ...applets].map((item) => {
        if (item === 'all') {
          const isActive = appletId === item;
          const backgroundColor = isActive
            ? colors.lightBlue
            : colors.secondary;
          return (
            <TouchableOpacity
              key={item}
              style={[styles.applet, { backgroundColor }]}
              onPress={() => {
                setCurrentApplet('all');
              }}
            >
              <View style={styles.imageWrapper}>
                <Text style={styles.allText}>A</Text>
              </View>
              <Text style={styles.name}>all applets</Text>
            </TouchableOpacity>
          );
        }
        const isActive = appletId === item.id;
        const backgroundColor = isActive ? colors.lightBlue : colors.secondary;
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.applet, { backgroundColor }]}
            onPress={() => {
              setCurrentApplet(item.id);
            }}
          >
            <View style={styles.imageWrapper}>
              <AppletImage applet={item} />
            </View>
            <Text ellipsizeMode="tail" numberOfLines={1} style={styles.name}>
              {item.name.en}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

AppletTabs.propTypes = {
  applets: PropTypes.array.isRequired,
  appletId: PropTypes.string.isRequired,
  setCurrentApplet: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  applets: appletsSelector(state),
  appletId: currentAppletIdSelector(state),
});

const mapDispatchToProps = {
  setCurrentApplet,
};

export default connect(mapStateToProps, mapDispatchToProps)(AppletTabs);
