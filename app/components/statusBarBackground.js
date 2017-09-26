'use strict'
import React, {Component} from 'react';
import {View, Text, StyleSheet, Platform} from 'react-native';

class StatusBarBackground extends Component{
  render(){
    return(
      <View style={[styles.statusBarBackground, this.props.style || {}]}> //This part is just so you can change the color of the status bar from the parents by passing it as a prop
      </View>
    );
  }
}

const styles = StyleSheet.create({
  statusBarBackground: {
    height: (Platform.OS === 'ios') ? 20 : 0, //this is just to test if the platform is iOS to give it a height of 20, else, no height (Android apps have their own status bar)
    backgroundColor: "white",
  }

})

module.exports= StatusBarBackground