import React, { Component } from 'react';
import { StyleSheet, Image, Platform } from 'react-native';
import { Button, View, Icon, Toast } from 'native-base';
import PropTypes from 'prop-types';

import randomString from 'random-string';
import { RNCamera } from 'react-native-camera';
import ImagePicker from 'react-native-image-picker';

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  camera: {
    width: '100%',
    height: 360,
    position: 'relative',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  footerText: {
    fontSize: 20,
    fontWeight: '300',
  },
  flipButton: {
    position: 'absolute',
    bottom: 8,
    left: 8,
  },
  pickButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
});

export default class CameraInput extends Component {
  componentWillMount() {
    this.setState({
      type: RNCamera.Constants.Type.back,
    });
  }

  pickPhoto = () => {
    const options = { title: 'Select Image' };
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('Image Picker error: ', response.error);
      } else {
        const picSource = { uri: (Platform.OS === 'ios') ? response.uri.replace('file://', '') : response.uri, filename: response.uri.split('/').pop() };
        this.props.onChange(picSource);
      }
    });
  }

  flip = () => {
    if (this.state.type === RNCamera.Constants.Type.back) {
      this.setState({ type: RNCamera.Constants.Type.front });
    } else {
      this.setState({ type: RNCamera.Constants.Type.back });
    }
  }

  onRetake = () => {
    this.props.onChange(undefined);
  }

  take = () => {
    this.takePicture();
  }

  takePicture() {
    if (this.camera) {
      const options = {
        quality: 0.5,
        fixOrientation: true,
        forceUpOrientation: true,
        pauseAfterCapture: true,
      };
      this.camera.takePictureAsync(options).then((data) => {
        const picSource = {
          uri: data.uri,
          filename: `image_${randomString()}.jpg`,
          type: this.state.type,
        };
        this.props.onChange(picSource);
      }).catch((err) => {
        Toast.show({ text: err.message, position: 'bottom', type: 'danger', buttonText: 'ok' });
      });
    }
  }

  render() {
    const { answer } = this.props;
    const { type } = this.state;
    const pic = answer;
    return (
      <View style={styles.body}>
        <View style={styles.camera}>
          {pic && (
          <Image
            source={pic}
            style={styles.camera}
            transform={pic.type === RNCamera.Constants.Type.front ? [{
              scaleX: -1,
            }] : undefined}
          />
          ) }
          {!pic && (
          <View>
            <RNCamera
              ref={(ref) => {
                this.camera = ref;
              }}
              style={styles.camera}
              type={type}
              flashMode={RNCamera.Constants.FlashMode.off}
              pauseAfterCapture
              permissionDialogTitle="Permission to use camera"
              permissionDialogMessage="We need your permission to use your camera phone"
            />
            <Button style={styles.flipButton} transparent onPress={this.flip}>
              <Icon name="reverse-camera" />
            </Button>
            <Button style={styles.pickButton} transparent onPress={this.pickPhoto}>
              <Icon name="image" />
            </Button>
          </View>
          ) }
        </View>
      </View>
    );
  }
}

CameraInput.propTypes = {
  answer: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
