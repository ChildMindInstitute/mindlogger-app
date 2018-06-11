import React, {Component} from 'react';
import {StyleSheet, StatusBar, Image} from 'react-native';
import { Container, Content, Text, Button, View, Icon, Header, Left, Right, Title, Body, Thumbnail, Item } from 'native-base';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions } from 'react-native-router-flux';
import * as Progress from 'react-native-progress';

import randomString from 'random-string';
import { RNCamera } from 'react-native-camera';

import SurveyTextInput from '../../components/SurveyTextInput';
import SurveyBoolSelector from '../../components/SurveyBoolSelector';
import SurveySingleSelector from '../../components/SurveySingleSelector';
import SurveyMultiSelector from '../../components/SurveyMultiSelector';
import SurveyImageSelector from '../../components/SurveyImageSelector';

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

export default class CameraScreen extends Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    const answer = this.props.answer && this.props.answer.result;
    this.setState({
      type: RNCamera.Constants.Type.back,
      answer,
    });
  }

  savePhoto() {
    let {uri, filename} = this.state.pic_source;
    let timestamp = Math.floor(Date.now());
    filename = `${timestamp}_${randomString({length:20})}_`+filename;
    uploadFileS3(uri, 'uploads/', filename).then(url => {
      this.props.onSave({result: url, time: Date.now()});
      this.setState({answer: url, pic_source: undefined});
      this.props.onNext();
    })
  }

  pickPhoto = () => {
    let options = {title: 'Select Image'}
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('Image Picker error: ', response.error);
      } else {
        let pic_source = {uri: response.uri, filename: response.fileName};
        this.setState({pic_source});
      }
    })
  }

  takePicture() {
    if (this.camera) {
      const options = { quality: 0.5, base64: true };
      this.camera.takePictureAsync(options).then(data => {
        console.log(data.uri);
        let pic_source = {uri: data.uri, filename: `image_${randomString()}.jpg`};
        this.setState({pic_source})
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
    this.setState({pic_source: undefined, answer: undefined});
  }

  take = () => {
    if (this.state.pic_source) {
      this.savePhoto();
    } else {
      this.takePicture();
    }
  }

  render() {
    const { question, onSave, onNext, onPrev} = this.props;
    let {type, pic_source, answer} = this.state;
    let pic = pic_source || answer;
    return (
      <View style={styles.body}>
        <Text>{question.title}</Text>
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
        <View style={styles.footer}>
          { pic_source ? 
            (<Button onPress={this.onRetake}>
              <Text>RETAKE</Text>
            </Button>) : 
            (<Button transparent onPress={onPrev}>
              <Icon name="arrow-back" />
            </Button>)
          }
          { answer == undefined && (<Button transparent={pic} onPress={this.take}><Text>{this.state.pic_source ? "SAVE" : "SNAP"}</Text></Button>) }
          <Button transparent onPress={onNext}>{answer ? <Icon name="arrow-forward" /> : <Text style={styles.footerText}>SKIP</Text>}</Button>
        </View>
      </View>
      );
  }
}
