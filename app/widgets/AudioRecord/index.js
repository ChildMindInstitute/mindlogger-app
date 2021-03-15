/* eslint-disable radix */
import React, { Component } from 'react';
import { View ,ScrollView,KeyboardAvoidingView } from 'react-native';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import { Item , Input } from 'native-base';
import AudioRecorder from './AudioRecorder';

export class AudioRecord extends Component {
 

  finalAnswer = {};

  handleComment = (itemValue) => {
    const {onChange} = this.props;
    this.finalAnswer["text"] = itemValue;
    
    onChange(this.finalAnswer);
  }

  onRecord = (filePath) => {
    const filename = (filePath && filePath.length > 0) && filePath.split('/').pop();
    this.finalAnswer["value"] = { uri: filePath, filename };
    this.props.onChange(this.finalAnswer);
  }


  render() {

    const { value, config,isOptionalText } = this.props;
    const maxLength = parseInt(R.path(['maxValue'], config));

    this.finalAnswer= value ? value :{};
    
    return (
      <KeyboardAvoidingView
      //behavior="padding"
    >
      <View style={{ paddingTop: 16, paddingBottom: 16 }}>
        <AudioRecorder
          onStop={this.onRecord}
          path={this.finalAnswer["value"] && this.finalAnswer["value"].uri}
          maxLength={Number.isNaN(maxLength) ? Infinity : maxLength}
        />
         {isOptionalText ? 
          (<View    style={{
                    marginTop: '35%' ,
                    width: '100%' ,
             
                  }}
                  >
      <Item bordered
       style={{borderWidth: 1}}
      >
     

      <Input
        
          placeholder = "Please enter the text"  
          onChangeText={text=>this.handleComment(text)}
          value={this.finalAnswer["text"]}
         
      />
    
      </Item> 
    </View>
    ):<View></View>
      }
      </View>
      </KeyboardAvoidingView>
    );
  }
}

AudioRecord.defaultProps = {
  value: undefined,
};

AudioRecord.propTypes = {
  value: PropTypes.shape({
    uri: PropTypes.string,
  }),
  onChange: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
};
