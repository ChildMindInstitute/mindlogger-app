import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { TouchBox, SubHeading, BodyText } from './core';
import AppletImage from './AppletImage';

const styles = StyleSheet.create({
  box: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 20,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textBlock: {
    flex: 1,
    marginLeft: 16,
  },
});

const AppletListItem = ({ applet }) => (
  <View style={styles.box}>
    <TouchBox>
      <View style={styles.inner}>
        <AppletImage applet={applet} />
        <View style={styles.textBlock}>
          <SubHeading>
            {applet.name.en}
          </SubHeading>
          <BodyText>
            {applet.description.en}
          </BodyText>
        </View>
      </View>
    </TouchBox>
  </View>
);

AppletListItem.propTypes = {
  applet: PropTypes.object.isRequired,
};

export default AppletListItem;
