import React, {Component} from 'react';
import {StyleSheet, Image, Platform, TouchableOpacity, Text} from 'react-native';
import { Button, View, Icon } from 'native-base';

import ImagePicker from 'react-native-image-picker';

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
  }, buttonText: {
    fontSize: 24,
    fontWeight: '300'
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
    backgroundColor: '#ffdddd'
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
  }
});

export default class CameraInput extends Component {
  constructor(props) {
    super(props)
  }

  //pick a photo from users camera roll or take a new picture with native camera
  takePhoto = () => {
    let options = { title: 'Select Image',
                    mediaType: 'photo',
                    storageOptions: {
                        cameraRoll: true,
                        waitUntilSaved: true,
                    }
                  }
    ImagePicker.launchCamera(options, (response) => {
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

  //pick a photo from users camera roll or take a new picture with native camera
  choosePhoto = () => {
    let options = { title: 'Select Image',
                    mediaType: 'photo',
                    storageOptions: {
                        cameraRoll: true,
                        waitUntilSaved: true,
                    }
                  }
    ImagePicker.launchImageLibrary(options, (response) => {
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

  //take a new picture/video with native camera
  take = () => {
    let options = { title: 'Select Video',
                    mediaType: ((this.props.video) ? 'video' : 'photo'),
                    storageOptions: {
                        cameraRoll: true,
                        waitUntilSaved: true,
                    }
                  }
    ImagePicker.launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled video picker');
      } else if (response.error) {
        console.log('Video Picker error: ', response.error);
      } else {
        let picSource = {uri: (Platform.OS == 'ios') ? response.uri.replace('file://','') : response.uri, filename: response.uri.split("/").pop()};
        console.log("uri --- " + response.uri);
        this.props.onChange(picSource);
      }
    })
  }


  //choose existing photo/video from device
  //doesnt seem to be working yet
/*  choose = () => {
    let options = { mediaType: ((this.props.video) ? 'video' : 'photo'),
                    storageOptions: {
                        cameraRoll: true,
                        waitUntilSaved: true,
                    }
                  }
    ImagePicker.launchImageLibrary({}, (response) => {
      if (response.didCancel) {
        console.log('User cancelled video picker');
      } else if (response.error) {
        console.log('Video Picker error: ', response.error);
      } else {
        let picSource = {uri: (Platform.OS == 'ios') ? response.uri.replace('file://','') : response.uri, filename: response.uri.split("/").pop()};
        console.log("uri --- " + response.uri);
        this.props.onChange(picSource);
      }
    })
  }
*/
  render() {
    //button labels depend on video/picture mode
    let takeButtonText = ((this.props.video) ? "Record New Video" : "Take New Picture");
    let chooseButtonText = ((this.props.video) ? "Choose Existing Video" : "Choose Existing Picture");

    const { answer } = this.props;
    let pic = answer;
    return (
      <View style={styles.body}>
        <View style={styles.camera}>
          {pic && <Image source={pic} style={{width: null, height: 200, flex: 1, margin: 20}}/> }
          {!pic && <View>
            <TouchableOpacity onPress={this.take}
                              style={styles.takeButton}>
                <Text style={styles.buttonText}>{takeButtonText}</Text>
            </TouchableOpacity>
          </View> }
        </View>
      </View>
      );
  }
}
