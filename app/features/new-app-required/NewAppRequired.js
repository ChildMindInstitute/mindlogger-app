import React from "react";
import {
  ImageBackground,
  Linking,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions
} from "react-native";


import {
  Logo,
  MindLoggerTitle,
  AppStore,
  PlayStore,
} from "../../../img/update-required/svg-images";

const clouds = require("../../../img/update-required/clouds.png");

const { width: VIEWPORT_WIDTH } = Dimensions.get('window');
const IS_IOS = Platform.OS === "ios";
const MAIN_COLOR = '#0167a0';
const IS_SMALL_SIZE_DEVICE = VIEWPORT_WIDTH <= 375;

const AppStoreLink = ({ storeUrl }) => {
  const onPress = () => {
    Linking.openURL(storeUrl);
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.storeIconContainer}>
      {IS_IOS ? <AppStore /> : <PlayStore />}
    </TouchableOpacity>
  );
};

const NewAppRequiredScreen = ({ storeUrl }) => {
  return (
    <>
      <StatusBar
        animated={true}
        backgroundColor={MAIN_COLOR}
        barStyle="light-content"
      />
      <ImageBackground
        source={clouds}
        resizeMode="cover"
        style={styles.cloudsBackground}
      >
        <View style={styles.headerContainer}>
          <Logo />
          <MindLoggerTitle />
          <Text style={[styles.headerText, styles.roboto]}>by Child Mind Institute</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.pardonTextContainer}>
            <Text style={[styles.pardonText, styles.roboto]}>Pardon the interruption</Text>
          </View>
          <View>
            <Text style={[styles.getNewAppText, styles.centeredText, styles.roboto]}>Get the new, improved app</Text>
            <Text style={[styles.keepUsingText, styles.centeredText, styles.roboto]}>To keep using MindLogger, you’ll
              need to download the new version.</Text>
            <AppStoreLink storeUrl={storeUrl} />
            <Text style={[styles.bottomText, styles.centeredText, styles.roboto]}>For best results, uninstall <Text
              style={styles.bottomBoldText}>Mindlogger Pilot</Text> after installing the new app.</Text>
          </View>
        </View>
      </ImageBackground>
    </>
  );
};




const styles = StyleSheet.create({
  cloudsBackground: {
    flex: 1,
    backgroundColor: MAIN_COLOR,
  },
  logo: {
    width: 130,
    height: 130,
    resizeMode: "contain",
  },
  headerContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
    marginHorizontal: "auto",
    width: "100%",
    flex: 4,
    marginTop: IS_SMALL_SIZE_DEVICE ? '5%' : '15%',
  },
  headerText: {
    fontWeight: "400",
    fontSize: IS_SMALL_SIZE_DEVICE ? 10 : 12,
    color: "#D5E4F7",
  },
  content: {
    flex: 5,
    paddingBottom: IS_SMALL_SIZE_DEVICE ? '5%' : '15%',
    paddingHorizontal: 24,
  },
  pardonTextContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  pardonText: {
    backgroundColor: "#f4e3b4",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
    fontSize: IS_SMALL_SIZE_DEVICE ? 13 : 16,
    fontWeight: "400",
    color: "#001D32",
  },
  getNewAppText: {
    color: MAIN_COLOR,
    fontSize: IS_SMALL_SIZE_DEVICE ? 26 : 32,
    fontWeight: "700",
    marginVertical: 15,
  },
  keepUsingText: {
    color: "#001D32",
    fontSize: IS_SMALL_SIZE_DEVICE ? 13 : 16,
    fontWeight: "400",
  },
  storeIconContainer: {
    marginTop: 25,
    marginBottom: 50,
    alignItems: "center",
  },
  bottomText: {
    color: "#51606F",
    fontWeight: "400",
    fontSize: IS_SMALL_SIZE_DEVICE ? 12 : 14,
  },
  bottomBoldText: {
    fontWeight: "700",
    fontSize: IS_SMALL_SIZE_DEVICE ? 12 : 14,
    color: "#51606f",
  },
  centeredText: {
    alignSelf: "center",
    textAlign: "center",
    width: "80%",
  },
  roboto: {
    fontFamily: "System",
  },
});

export { NewAppRequiredScreen };
