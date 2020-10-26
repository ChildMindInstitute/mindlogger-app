import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Image, TouchableOpacity, Platform, StyleSheet, Alert } from 'react-native';
import { View, Icon } from 'native-base';
import ImagePicker from 'react-native-image-picker';
import i18n from 'i18next';

const VIDEO_MIME_TYPE = Platform.OS === 'ios' ? 'video/quicktime' : 'video/mp4';

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  camera: {
    width: '100%',
    flex: 1,
    position: 'relative',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '300',
  },
  takeButton: {
    borderRadius: 12,
    width: '100%',
    height: 360,
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#d10000',
    backgroundColor: '#ffdddd',
  },
  videoConfirmed: {
    borderRadius: 12,
    width: '100%',
    height: 360,
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#00a30a',
    backgroundColor: '#99ff9f',
  },
  chooseButton: {
    borderRadius: 12,
    width: '100%',
    height: 116,
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#000000',
    backgroundColor: '#dbdbdb',
    marginTop: 8,
  },
  redIcon: {
    color: '#d10000',
    fontSize: 60,
  },
  greenIcon: {
    color: '#00a30a',
    fontSize: 60,
  },
  image: {
    height: 360,
    width: '100%',
    backgroundColor: 'black',
    resizeMode: 'contain',
  },
});

export class Camera extends Component {
  libraryAlert = (options, callback) => {
    Alert.alert(
      `${i18n.t('camera:choose')} ${options.mediaType}`,
      `${i18n.t('camera:take_a_new')} ${options.mediaType} ${i18n.t('camera:or_choose')}`,
      [
        {
          text: i18n.t('camera:camera'),
          onPress: () => {
            ImagePicker.launchCamera(options, (response) => {
              response.choice = 'camera';
              callback(response);
            });
          },
        },
        {
          text: i18n.t('camera:library'),
          onPress: () => {
            ImagePicker.launchImageLibrary(options, (response) => {
              response.choice = 'library';
              callback(response);
            });
          },
        },
      ],
      { cancelable: true },
    );
  };

  take = () => {
    const { video, onChange, config } = this.props;
    const options = {
      mediaType: video ? 'video' : 'photo',
      storageOptions: {
        cameraRoll: true,
        waitUntilSaved: true,
      },
      quality: 0.5,
      cameraType: 'front',
      videoQuality: 'low',
      maxWidth: 2048,
      maxHeight: 2048,
    };

    const pickerFunc = config.allowLibrary ? this.libraryAlert : ImagePicker.launchCamera;

    pickerFunc(options, (response) => {
      if (!response.didCancel && !response.error) {
        const uri = Platform.OS === 'ios' ? response.uri.replace('file://', '') : response.uri;
        const filename = response.uri.split('/').pop();
        const picSource = {
          uri,
          filename,
          type: response.type || VIDEO_MIME_TYPE,
          fromLibrary: response.choice === 'library',
        };
        onChange(picSource);
      }
    });
  };

  render() {
    const { value, video } = this.props;
    const iconName = video ? 'video-camera' : 'camera';
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
            <TouchableOpacity onPress={this.take} style={styles.takeButton}>
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
