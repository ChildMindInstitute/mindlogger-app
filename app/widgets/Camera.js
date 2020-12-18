import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Image,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";
import { View, Icon } from "native-base";
import ImagePicker from "react-native-image-picker";
import i18n from "i18next";
import RNFetchBlob from "rn-fetch-blob";
import { PermissionsAndroid } from "react-native";
const VIDEO_MIME_TYPE = Platform.OS === "ios" ? "video/quicktime" : "video/mp4";
const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  camera: {
    width: "100%",
    flex: 1,
    position: "relative",
  },
  buttonText: {
    fontSize: 24,
    fontWeight: "300",
  },
  takeButton: {
    borderRadius: 12,
    width: "100%",
    height: 360,
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#d10000",
    backgroundColor: "#ffdddd",
  },
  videoConfirmed: {
    borderRadius: 12,
    width: "100%",
    height: 360,
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#00a30a",
    backgroundColor: "#99ff9f",
  },
  chooseButton: {
    borderRadius: 12,
    width: "100%",
    height: 116,
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#000000",
    backgroundColor: "#dbdbdb",
    marginTop: 8,
  },
  redIcon: {
    color: "#d10000",
    fontSize: 60,
  },
  greenIcon: {
    color: "#00a30a",
    fontSize: 60,
  },
  image: {
    height: 360,
    width: "100%",
    backgroundColor: "black",
    resizeMode: "contain",
  },
});
export class Camera extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filePath: "",
      fileData: "",
      fileUri: null,
      videoSource: null,
    };
  }

  isIos = Platform.OS === "ios";

  libraryAlert = (options, callback) => {
    const { video, onChange, config } = this.props;
    Alert.alert(
      `${i18n.t("camera:choose")} ${options.mediaType}`,
      `${i18n.t("camera:take_a_new")} ${options.mediaType} ${i18n.t(
        "camera:or_choose"
      )}`,
      [
        {
          text: i18n.t("camera:camera"),
          onPress: video ? this.take : this.launchCamForCam,
        },
        {
          text: i18n.t("camera:library"),
          onPress: this.launchImageLibrary,
        },
      ],
      { cancelable: true }
    );
  };
  launchImageLibrary = () => {
    const { video } = this.props;
    console.log({ video }, "videasdfasdf");
    let options = {
      mediaType: video ? "video" : "photo",
      storageOptions: {
        skipBackup: true,
        path: video ? "video" : "photo",
      },
      videoQuality: "low",
      quality: 0.1,
      durationLimit: 5,
      saveToPhotos: false,
      maxWidth: 800,
      maxHeight: 800,
    };
    console.log({ options }, "options");
    ImagePicker.launchImageLibrary(options, (response) => {
      console.log({ response });
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error);
      } else if (response.customButton) {
        console.log("User tapped custom button: ", response.customButton);
        alert(response.customButton);
      } else {
        const source = { uri: response.uri };
        this.setState({
          filePath: response.path,
          fileData: response.data,
          fileUri: response.uri,
        });
      }
      if (!response.didCancel && !response.error) {
        const { onChange } = this.props;
        const filename = this.isIos
          ? response.uri.split("/").pop()
          : response.path.split("/").pop();
        // console.log({ filename });
        const toPath = `${RNFetchBlob.fs.dirs.DocumentDir}/${filename}`;
        console.log({ path: toPath });
        const picSource = {
          uri: `file://${toPath}`,
          filename,
          type: response.type,
          fromLibrary: response.choice === "library",
        };
        console.log({ picSource });
        let fileManager = RNFetchBlob.fs.cp(
          this.isIos ? response.uri : response.path,
          picSource.uri.split("///").pop()
        );
        console.log(fileManager, "fileManager");
        if (response.choice === "library") {
          fileManager = fileManager.then(() =>
            RNFetchBlob.fs.unlink(this.isIos ? response.uri : response.path)
          );
        }
        fileManager
          .then(() => {
            onChange(picSource);
          })
          .catch((e) => {
            console.error(e);
          });
      }
    });
  };
  launchCamForCam = () => {
    let options = {
      mediaType: "photo",
      storageOptions: {
        skipBackup: true,
        path: "images",
      },
    };
    ImagePicker.launchCamera(options, (response) => {
      const { onChange } = this.props;
      this.setState({
        fileUri: response.uri,
        filePath: response.path,
      });
      response.choice = "camera";
      if (!response.didCancel && !response.error) {
        const filename = response.path.split("/").pop();
        const toPath = `${RNFetchBlob.fs.dirs.DocumentDir}/${filename}`;
        const picSource = {
          uri: Platform.OS === "ios" ? toPath : `file://${toPath}`,
          filename,
          type: response.type || VIDEO_MIME_TYPE,
          fromLibrary: response.choice === "camera",
        };
        let fileManager = RNFetchBlob.fs.cp(
          response.path,
          picSource.uri.split("///").pop()
        );
        if (response.choice === "camera") {
          fileManager = fileManager.then(() =>
            RNFetchBlob.fs.unlink(response.path)
          );
        }
        fileManager
          .then(() => {
            onChange(picSource);
          })
          .catch((e) => {
            console.error(e);
          });
      }
    });
  };
  take = () => {
    try {
      const { video, onChange, config } = this.props;
      console.log({ video });
      const options = {
        mediaType: "video",
        storageOptions: {
          cameraRoll: true,
          waitUntilSaved: true,
        },
        videoQuality: "low",
        quality: 0.5,
      };
      const pickerFunc = config.allowLibrary
        ? this.launchImageLibrary
        : ImagePicker.launchCamera;
      pickerFunc(options, (response) => {
        console.log(response, "video response");
        if (response.error) {
          alert(response.error);
        }
        if (!response.didCancel && !response.error) {
          const filename = response.path.split("/").pop();
          const toPath = `${RNFetchBlob.fs.dirs.DocumentDir}/${filename}`;
          const picSource = {
            uri: Platform.OS === "ios" ? toPath : `file://${toPath}`,
            filename,
            type: response.type || VIDEO_MIME_TYPE,
            fromLibrary: response.choice === "library",
          };
          let fileManager = RNFetchBlob.fs.cp(
            response.path,
            picSource.uri.split("///").pop()
          );
          if (response.choice !== "library") {
            fileManager = fileManager.then(() =>
              RNFetchBlob.fs.unlink(response.path)
            );
          }
          fileManager
            .then(() => {
              onChange(picSource);
            })
            .catch((e) => {
              console.error(e, "asdasdasd");
              console.log({ e });
            });
        }
      });
    } catch (error) {
      console.log({ error });
    }
  };
  render() {
    const { value, video } = this.props;
    // console.log({ v: value });
    const iconName = video ? "video-camera" : "camera";
    // this.getImageFromCamera();
    return (
      <View style={styles.body}>
        {value && video && (
          <View style={styles.videoConfirmed}>
            <Icon type="Entypo" name="check" style={styles.greenIcon} />
          </View>
        )}
        {value && !video && <Image source={value} style={styles.image} />}
        {!value && (
          <View>
            <TouchableOpacity
              onPress={this.libraryAlert}
              style={styles.takeButton}
            >
              <Icon type="Entypo" name={iconName} style={styles.redIcon} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }
}
Camera.defaultProps = {
  value: undefined,
  video: false,
  config: {
    allowLibrary: true,
  },
};
Camera.propTypes = {
  video: PropTypes.bool,
  value: PropTypes.shape({
    uri: PropTypes.string,
  }),
  config: PropTypes.shape({
    allowLibrary: PropTypes.bool,
  }),
  onChange: PropTypes.func.isRequired,
};
