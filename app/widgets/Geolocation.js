import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { View, Text, Platform, TouchableOpacity, StyleSheet } from 'react-native';
import NativeGeolocation from '@react-native-community/geolocation';
import { Icon } from 'native-base';
import Permissions, { PERMISSIONS } from 'react-native-permissions';
import { colors } from '../theme';

const styles = StyleSheet.create({
  locationButton: {
    borderRadius: 3,
    backgroundColor: colors.primary,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 1,
  },
  buttonText: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 18,
    marginLeft: 5,
    marginRight: 5,
  },
  container: {
    alignItems: 'flex-start',
  },
  infoText: {
    color: colors.tertiary,
    fontSize: 16,
    marginTop: 16,
  },
});

export const Geolocation = ({ value, onChange }) => {
  const [locationPermission, setLocationPermission] = useState('undetermined');
  const permission = Platform.select({
    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
  });

  useEffect(() => {
    Permissions.check(permission).then(setLocationPermission);
  });

  const onPress = () => {
    Permissions.request(permission).then((response) => {
      // console.log(response);
      setLocationPermission(response);
      if (response === Permissions.RESULTS.GRANTED) {
        NativeGeolocation.getCurrentPosition(
          (successResponse) => {
            onChange({
              latitude: successResponse.coords.latitude,
              longitude: successResponse.coords.longitude,
            });
          },
          (errorResponse) => {
            console.warn(errorResponse);
          },
        );
      }
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.locationButton}>
          <Text style={styles.buttonText}>GET LOCATION</Text>
          <Icon style={styles.buttonText} type="FontAwesome" name="map-marker" />
        </View>
      </TouchableOpacity>
      {
        locationPermission === 'denied' && Platform.OS === 'ios' && (
          <View>
            <Text style={styles.infoText}>
              You must enable Location services to complete this task. Please
              grant MindLogger permission in your iOS Settings and press the
              button again.
            </Text>
          </View>
        )
      }
      {
        locationPermission === 'denied' && Platform.OS === 'android' && (
          <View>
            <Text style={styles.infoText}>
              You must enable Location services to complete this task. Please
              press the button again and grant MindLogger permission to use your
              location.
            </Text>
          </View>
        )
      }
      {
        locationPermission !== 'denied' && typeof value.latitude !== 'undefined' && (
          <View>
            <Text style={styles.infoText}>
              Location saved.
            </Text>
          </View>
        )
      }
    </View>
  );
};

Geolocation.defaultProps = {
  value: {},
  onChange: () => {},
};

Geolocation.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func,
};
