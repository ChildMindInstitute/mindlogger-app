import React, {Component} from 'react';
import {StyleSheet, ImageBackground, TouchableOpacity} from 'react-native';
import { Content, View, List, ListItem, Text, Button, Right, Body, Radio, Thumbnail } from 'native-base';
import { connect } from 'react-redux';
import baseTheme from '../../../themes/baseTheme'
import SurveyInputComponent from './SurveyInputComponent'

var styles = StyleSheet.create({
  imagesContainer: {
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row'
  },
  image: {
    paddingTop: 50,
    width: 120,
    height: 120,
    margin: 10,
    borderRadius: 4,
  },
  imageSelected: {
    paddingTop: 50,
    width: 120,
    height: 120,
    margin: 10,
    borderRadius: 4,
    borderWidth: 4,
    borderColor: '#ff345a',
  },
  backdropView: {
    height: 20,
    width: 120,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  headline: {
    fontSize: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
    color: 'black'
  }
});

class SurveyImageSelector extends SurveyInputComponent {
  constructor(props) {
    super(props);
  }

  onToggle(value) {
    let { data:{ answer, question }, multi } = this.props;
    if (multi) {
      answer = answer || [];
      const index = answer.indexOf(value)
      if(index<0) {
        answer.push(index);
      } else {
        answer.splice(index, 1);
      }
      this.selectAnswer(answer, false);
    } else {
      if (answer != value) {
        this.selectAnswer(value, true);
      } else {
        this.selectAnswer(undefined, false);
      }
    }
  }

  render() {
    let { data:{ answer, question }, multi } = this.props;
    const { title, images } = question;
    if (multi) {
      answer = answer || [];
    }

    return (
      <View style={{alignItems:'stretch'}}>
        { !this.props.disableHeader && (<Text style={baseTheme.paddingView}>{title}</Text>) }
        <View style={styles.imagesContainer}>
        {
          images.map((item, idx) => {
            let isSelected = multi ? answer.includes(idx) : idx == answer
            return (
                  <TouchableOpacity key={idx} onPress={() => this.onToggle(idx)}>
                  <ImageBackground style={ isSelected ? styles.imageSelected : styles.image} source={{uri: item.image_url}}>
                  </ImageBackground>
                </TouchableOpacity>
              )
          })
        }
        </View>
      </View>
    )
  }
}

export default connect(state => ({
  }),
  (dispatch) => ({
    //actions: bindActionCreators(counterActions, dispatch)
  })
)(SurveyImageSelector);
