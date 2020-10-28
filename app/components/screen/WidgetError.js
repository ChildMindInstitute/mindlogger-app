import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme';
import BaseText from '../base_text/base_text';

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 4,
    borderColor: colors.primary,
    padding: 20,
  },
  heading: {
    marginBottom: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  body: {
    color: colors.primary,
    marginBottom: 5,
  },
});

const WidgetError = () => (
  <View style={styles.container}>
    <BaseText style={styles.heading} textKey="widget_error:error_text" />
    <BaseText style={styles.body} textKey="widget_error:error_description" />
  </View>
);

export default WidgetError;
