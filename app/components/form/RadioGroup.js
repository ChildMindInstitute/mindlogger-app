import React from 'react';
import { Item, Input, Label, Text,Radio } from 'native-base';
const RadioGroup = ({ type,input, name, options, stackedLabel , meta: { touched, error, warning } }) => {
    var hasError= false;
    if(error !== undefined){
      hasError= true;
    }
    return( <Item stackedLabel={stackedLabel} style= {{ margin: 10 }} error= {hasError}>
                <Label>{label}</Label>
                <Input {...input}/>
                {hasError ? <Text>{error}</Text> : <Text />}
            </Item> )
}

export default RadioGroup