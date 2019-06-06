import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Image, TouchableOpacity, Platform } from 'react-native';
import { View, Icon } from 'native-base';
import ImagePicker from 'react-native-image-picker';
import styles from '../themes/activityTheme';

const VIDEO_MIME_TYPE = Platform.OS === 'ios' ? 'video/quicktime' : 'video/mp4';

export class Camera extends Component {
  take = () => {
    const { video, onChange } = this.props;
    const options = {
      mediaType: video ? 'video' : 'photo',
      storageOptions: {
        cameraRoll: true,
        waitUntilSaved: true,
      },
      quality: 0.5,
      cameraType: 'back',
      videoQuality: 'low',
      maxWidth: 2048,
      maxHeight: 2048,
      chooseFromLibraryButtonTitle: 'Library',
    };
    ImagePicker.launchCamera(options, (response) => {
      if (!response.didCancel && !response.error) {
        const uri = Platform.OS === 'ios' ? response.uri.replace('file://', '') : response.uri;
        const filename = response.uri.split('/').pop();
        const picSource = {
          uri,
          filename,
          type: response.type || VIDEO_MIME_TYPE,
        };
        onChange(picSource);
      }
    });
  }

  render() {
    const { value, video } = this.props;
    const iconName = video ? 'video-camera' : 'camera';
    return (
      <View style={styles.body}>
        <View style={styles.camera}>
          {value && video && (
            <View style={styles.videoConfirmed}>
              <Icon
                type="Entypo"
                name="check"
                style={styles.greenIcon}
              />
            </View>
          )}
          {value && !video && (
            <Image
              source={value}
              style={{ width: null, height: 200, flex: 1, margin: 20 }}
            />
          )}
          {!value && (
            <View>
              <TouchableOpacity
                onPress={this.take}
                style={styles.takeButton}
              >
                <Icon type="Entypo" name={iconName} style={styles.redIcon} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }
}

Camera.defaultProps = {
  value: undefined,
  video: false,
};

Camera.propTypes = {
  video: PropTypes.bool,
  value: PropTypes.shape({
    uri: PropTypes.string,
  }),
  onChange: PropTypes.func.isRequired,
};
