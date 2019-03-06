import React, {Component} from 'react';
import {StyleSheet, Image, Platform, TouchableOpacity, Text} from 'react-native';
import { Button, View, Icon } from 'native-base';
import ImagePicker from 'react-native-image-picker';
import styles from '../../../../themes/activityTheme';

export default class CameraInput extends Component {

  //props: video- indicates whether to allow user to upload videos. when videos is false, only photos can be uploaded
  //take a new picture/video with native camera
  take = () => {
    const options = { mediaType: ((this.props.video) ? 'video' : 'photo'),
                    storageOptions: {
                        cameraRoll: true,
                        waitUntilSaved: true,
                    }
                  };
    ImagePicker.launchCamera(options, (response) => {
      if (response.didCancel) {
      } else if (response.error) {
      } else {
        let picSource = {uri: (Platform.OS == 'ios') ? response.uri.replace('file://','') : response.uri, filename: response.uri.split("/").pop()};
        this.props.onChange(picSource);
      }
    })
  }


  render() {
    //icon depend on video/picture mode
    let iconName = ((this.props.video) ? "video-camera" : "camera");

    const { answer } = this.props;
    let pic = answer;
      return (
        <View style={styles.body}>
          <View style={styles.camera}>
            {pic && this.props.video && <View
                                style={styles.videoConfirmed}>
                  <Icon type='Entypo' name={"check"} style={styles.greenIcon}></Icon>
              </View> }
            {pic && !this.props.video && <Image source={pic} style={{width: null, height: 200, flex: 1, margin: 20}}/> }
            {!pic && <View>
              <TouchableOpacity onPress={this.take}
                                style={styles.takeButton}>
                  <Icon type='Entypo' name={iconName} style={styles.redIcon}></Icon>
              </TouchableOpacity>
            </View> }
          </View>
        </View>
      );
  }
}
