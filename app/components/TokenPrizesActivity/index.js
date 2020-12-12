import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { Icon } from 'native-base';
import TouchBox from '../core/TouchBox';
import { SubHeading, NotificationDot, BodyText, LittleHeading } from '../core';
import { colors } from '../../theme';
import theme from '../../themes/base-theme';

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
  sectionHeading: {
    marginTop: 20,
    marginBottom: 0,
    marginLeft: 20,
    marginRight: 20,
    borderBottomWidth: 1,
    borderColor: colors.grey,
    flex: 1,
    fontFamily: theme.fontFamily,
  },
  moreInfo: {
    marginTop: 16,
    width: "auto",
  },
  layout: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  left: {
    flex: 1,
  },
  right: {
    flex: 0,
    paddingLeft: 16,
  },
  icon: {
    color: "#AAA",
    fontSize: 18,
  },
});

const TokenPrizesActivity = ({
  prizesActivity,
  onPress,
  onLongPress,
}) => (
  <View style={styles.box}>
    <TouchBox
      disabled={false}
      onPress={() => onPress(prizesActivity)}
      onLongPress={() => onLongPress(prizesActivity)}
    >
      <View style={styles.layout}>
        <View style={styles.left}>
          <SubHeading
            style={{
              fontFamily: theme.fontFamily,
            }}
          >
            {prizesActivity.name.en}
          </SubHeading>
          {prizesActivity.description && (
            <BodyText
              style={{
                fontFamily: theme.fontFamily,
              }}
            >
              {prizesActivity.description.en}
            </BodyText>
          )}
        </View>
        <View style={styles.right}>
          <Icon type="FontAwesome" name="chevron-right" style={styles.icon} />
        </View>
      </View>
    </TouchBox>
  </View>
);

TokenPrizesActivity.propTypes = {
  prizesActivity: PropTypes.object.isRequired,
  onPress: PropTypes.func.isRequired,
  onLongPress: PropTypes.func.isRequired,
};

export default TokenPrizesActivity;
