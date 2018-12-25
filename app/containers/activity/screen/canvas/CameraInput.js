import React, {Component} from 'react';
import {StyleSheet, Image, Platform} from 'react-native';
import { Button, View, Icon } from 'native-base';

import randomString from 'random-string';
import { RNCamera } from 'react-native-camera';
import ImagePicker from 'react-native-image-picker';
import { getFileInfoAsync } from '../../../../helper';

const styles=StyleSheet.create({
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
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    this.setState({
      type: RNCamera.Constants.Type.back,
    });
  }

  pickPhoto = () => {
    let options = {title: 'Select Image'}
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('Image Picker error: ', response.error);
      } else {
        let picSource = {uri: (Platform.OS == 'ios') ? response.uri.replace('file://','') : response.uri, filename: response.uri.split("/").pop()};
        this.props.onChange(picSource);
      }
    })
  }

  takePicture() {
    if (this.camera) {
      const options = { quality: 0.5, base64: true };
      this.camera.takePictureAsync(options).then(data => {
        console.log(data.uri);
        let picSource = {uri: data.uri, filename: `image_${randomString()}.jpg`};
        this.props.onChange(picSource);
      }).catch( err => {
        Toast.show({text: err.message, position: 'bottom', type: 'danger', buttonText: 'ok'})
      })
    }
  }

  flip = () => {
    if (this.state.type == RNCamera.Constants.Type.back) {
      this.setState({type: RNCamera.Constants.Type.font});
    } else {
      this.setState({type: RNCamera.Constants.Type.back});
    }
  }
  onRetake = () => {
    this.props.onChange(undefined);
  }

  take = () => {
    this.takePicture();
  }

  render() {
    const { onNext, onPrev, answer} = this.props;
    let {type} = this.state;
    let pic = answer;
    console.log(answer);
    return (
      <View style={styles.body}>
        <View style={styles.camera}>
          {pic && <Image source={pic} style={{width: null, height: 200, flex: 1, margin: 20}}/> }
          {!pic && <View>
            <RNCamera
              ref={ref => {
                this.camera = ref;
              }}
              style={styles.camera}
              type={type}
              flashMode={RNCamera.Constants.FlashMode.on}
              permissionDialogTitle={'Permission to use camera'}
              permissionDialogMessage={'We need your permission to use your camera phone'}
            />
            <Button style={styles.flipButton} transparent onPress={this.flip}>
              <Icon name="reverse-camera" />
            </Button>
            <Button style={styles.pickButton} transparent onPress={this.pickPhoto}>
              <Icon name="image" />
            </Button>
          </View> }
        </View>
      </View>
      );
  }
}
