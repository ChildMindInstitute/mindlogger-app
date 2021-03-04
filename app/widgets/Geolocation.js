import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { View, Platform, TouchableOpacity, StyleSheet } from "react-native";
import NativeGeolocation from "@react-native-community/geolocation";
import { Icon , Item , Input} from "native-base";
import Permissions, { PERMISSIONS } from "react-native-permissions";
import { colors } from "../theme";
import BaseText from "../components/base_text/base_text";

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
  },
  infoText: {
    color: colors.tertiary,
    fontSize: 16,
    marginTop: 16,
  },
});

export const Geolocation = ({ value, onChange ,isOptionalText}) => {
  const [locationPermission, setLocationPermission] = useState("undetermined");
  const permission = Platform.select({
    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
  });


  finalAnswer= value ? value :[];


  handleComment = (itemValue) => {
    
    this.finalAnswer["text"] = itemValue;
    
    onChange(this.finalAnswer);
  }

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
            this.finalAnswer["value"] = {
              latitude: successResponse.coords.latitude,
              longitude: successResponse.coords.longitude,
            } ;

            onChange(this.finalAnswer);
          },
          (errorResponse) => {
            console.warn(errorResponse);
          }
        );
      }
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.locationButton}>
          <BaseText
            style={styles.buttonText}
            textKey="geolocation:get_location"
          />
          <Icon
            style={styles.buttonText}
            type="FontAwesome"
            name="map-marker"
          />
        </View>
      </TouchableOpacity>
      {locationPermission === "denied" && Platform.OS === "ios" && (
        <View>
          <BaseText
            style={styles.infoText}
            textKey="geolocation:must_enable_location"
          />
        </View>
      )}
      {locationPermission === "denied" && Platform.OS === "android" && (
        <View>
          <BaseText
            style={styles.infoText}
            textKey="geolocation:must_enable_location_subtitle"
          />
        </View>
      )}
      {locationPermission !== "denied" &&
        typeof this.finalAnswer["value"]?.latitude !== "undefined" && (
          <View>
            <BaseText
              style={styles.infoText}
              textKey="geolocation:location_saved"
            />
          </View>
        )}
        {isOptionalText ? 
      (<View    style={{
                    marginTop: '8%' ,
                    width: '100%' ,
                    justifyContent: 'center',
                  }}
                  >
      <Item bordered>
      <Input
          placeholder = "please enter the text"  
          onChangeText={text=>handleComment(text)}
          value={this.finalAnswer["text"]}
      />
      </Item> 
    </View>
    ):<View></View>
      }
    </View>
  );
};

Geolocation.defaultProps = {
  value: {},
  onChange: () => {},
 // isOptionalText,
};

Geolocation.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func,
  isOptionalText: PropTypes.bool
};
