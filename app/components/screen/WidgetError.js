import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors } from '../../theme';

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
    <Text style={styles.heading}>
      There was a problem loading this screen.
    </Text>
    <Text style={styles.body}>
      Please ensure you have the latest version of MindLogger installed, then
      contact your activity administrator.
    </Text>
  </View>
);

export default WidgetError;
