import React from "react";
import PropTypes from "prop-types";
import { View, StyleSheet } from "react-native";
import TouchBox from "./core/TouchBox";
import { SubHeading, BodyText, NotificationText } from "./core";
import AppletImage from "./AppletImage";
import theme from "../themes/variables";
import { CachedImage } from 'react-native-img-cache';

const styles = StyleSheet.create({
  box: {
    position: "relative",
    fontFamily: theme.fontFamily,
  },
  inner: {
    flexDirection: "row",
    alignItems: "flex-start",
    fontFamily: theme.fontFamily,
  },
  textBlock: {
    flex: 1,
    marginLeft: 16,
    fontFamily: theme.fontFamily,
  },
  headerBlock: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  notification: {
    position: "absolute",
    top: 0,
    right: 10,
  },
});

const AppletListItem = ({ applet, disabled, onPress }) => {
  const numberOverdue = applet.activities.reduce(
    (accumulator, activity) =>
      activity.isOverdue ? accumulator + 1 : accumulator,
    0
  );

  const maxWidthStyle = applet && applet.theme && applet.theme.logo ? { maxWidth: '72%' } : {};

  const ThemeLogo = () => {
    if (applet && applet.theme) {
      if (applet.theme.smallLogo) {
        return <CachedImage
          style={{ width: 60, height: 30, resizeMode: 'contain', marginTop: -5 }}
          source={{ uri: applet.theme.smallLogo }}
        />
      } else if (applet.theme.logo) {
        return <CachedImage
          style={{ width: 32, height: 32, resizeMode: 'cover', borderRadius: 32 / 2 }}
          source={{ uri: applet.theme.logo }}
        />
      }
      return null;
    }
  }

  return (
    <View style={styles.box}>
      <TouchBox onPress={() => onPress(applet)} disabled={disabled}>
        <View style={styles.inner}>
          <AppletImage applet={applet} />
          <View style={styles.textBlock}>
            <View style={styles.headerBlock}>
              <SubHeading style={{ fontFamily: theme.fontFamily, ...maxWidthStyle }}>
                {applet.name.en}
              </SubHeading>
              {ThemeLogo()}
            </View>
            {applet.description && (
              <BodyText style={{ fontFamily: theme.fontFamily }}>
                {applet.description.en}
              </BodyText>
            )}
          </View>
        </View>
      </TouchBox>
      {numberOverdue > 0 && (
        <View style={styles.notification}>
          <NotificationText>{numberOverdue}</NotificationText>
        </View>
      )}
    </View>
  );
};

AppletListItem.propTypes = {
  applet: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  onPress: PropTypes.func.isRequired,
};

export default AppletListItem;
