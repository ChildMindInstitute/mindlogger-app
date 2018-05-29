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

  render() {
    let { data:{ answer, question }, multi } = this.props;
    const { title, images } = question;
    answer = answer || [];
    return (
      <View style={{alignItems:'stretch'}}>
        { !this.props.disableHeader && (<Text style={baseTheme.paddingView}>{title}</Text>) }
        <View style={styles.imagesContainer}>
        {
          images.map((item, idx) => {
            let isSelected = multi ? answer.includes(idx) : idx == answer
            return (
                  <TouchableOpacity key={idx} onPress={() => {
                    if (multi) {
                      answer.push(idx)
                      this.selectAnswer(answer, false);
                    } else {
                      this.selectAnswer(idx, true);
                    }
                  }}>
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
