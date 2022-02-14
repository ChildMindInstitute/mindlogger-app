import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { View, Platform, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView } from "react-native";
import NativeGeolocation from "@react-native-community/geolocation";
import { Icon } from "native-base";
import Permissions, { PERMISSIONS } from "react-native-permissions";
import _ from "lodash";
import { colors } from "../theme";
import BaseText from "../components/base_text/base_text";
import { OptionalText } from "./OptionalText";
import { showToast } from "../state/app/app.thunks";
import { connect } from 'react-redux';
import i18n from 'i18next';

const styles = StyleSheet.create({
  locationButton: {
    borderRadius: 3,
    backgroundColor: colors.primary,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 1,
  },
  buttonText: {
    fontWeight: "bold",
    color: "white",
    fontSize: 18,
    marginLeft: 5,
    marginRight: 5,
  },
  container: {
    alignItems: "flex-start",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  imgContainer: {
    padding: 20,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  img: {
    width: 300,
    height: 300,
  },
  infoText: {
    color: colors.tertiary,
    fontSize: 16,
    marginTop: 16,
  },
});

const GeolocationComponent = ({ config, value, onChange, isOptionalText, isOptionalTextRequired, showToast }) => {
  const [locationPermission, setLocationPermission] = useState("undetermined");
  const permission = Platform.select({
    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
  });

  let finalAnswer = value ? _.cloneDeep(value) : {};

  const handleComment = (itemValue) => {
    finalAnswer["text"] = itemValue;

    onChange(finalAnswer);
  };

  useEffect(() => {
    Permissions.check(permission).then(setLocationPermission);
  }, []);

  const onPress = () => {
    Permissions.request(permission).then((response) => {
      setLocationPermission(response);
      if (response === Permissions.RESULTS.GRANTED) {
        NativeGeolocation.getCurrentPosition(
          (successResponse) => {
            finalAnswer["value"] = {
              latitude: successResponse.coords.latitude,
              longitude: successResponse.coords.longitude,
            };

            onChange(finalAnswer);
          },
          (errorResponse) => {
            showToast({
              text: i18n.t('geolocation:service_not_available'),
              position: 'bottom',
              duration: 2000,
            });

            setLocationPermission('denied');
          }
        );
      } else {
        showToast({
          text: i18n.t('geolocation:service_not_available'),
          position: 'bottom',
          duration: 2000,
        });

        setLocationPermission('denied');
      }
    });
  };

  return (
    <KeyboardAvoidingView
    // behavior="padding"
    >
      <View style={styles.container}>
        <TouchableOpacity onPress={onPress}>
          <View style={styles.locationButton}>
            <BaseText style={styles.buttonText} textKey="geolocation:get_location" />
            <Icon style={styles.buttonText} type="FontAwesome" name="map-marker" />
          </View>
        </TouchableOpacity>

        <View>
          {typeof finalAnswer["value"]?.latitude !== "undefined" ? (
            <BaseText style={styles.infoText} textKey="geolocation:location_saved" />
          ) : (
            locationPermission === "denied" &&
            (Platform.OS === "ios" ? (
              <BaseText style={styles.infoText} textKey="geolocation:must_enable_location" />
            ) : (
              <BaseText style={styles.infoText} textKey="geolocation:must_enable_location_subtitle" />
            ))
          )}
        </View>

        {config?.image && (
          <View style={styles.imgContainer}>
            <Image
              style={styles.img}
              source={{
                uri: config.image,
              }}
            />
          </View>
        )}

        {isOptionalText && (
          <OptionalText
            isRequired={isOptionalTextRequired}
            value={finalAnswer["text"]}
            onChangeText={(text) => handleComment(text)}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

GeolocationComponent.defaultProps = {
  value: {},
  onChange: () => {},
};

GeolocationComponent.propTypes = {
  config: PropTypes.object,
  value: PropTypes.object,
  onChange: PropTypes.func,
  isOptionalText: PropTypes.bool,
  isOptionalTextRequired: PropTypes.bool,
};


const mapStateToProps = (state) => ({
});

const mapDispatchToProps = {
  showToast,
};

export const Geolocation = connect(mapStateToProps, mapDispatchToProps)(GeolocationComponent);
