import React from 'react';
import { Item, Input, Label, Text } from 'native-base';
const FormItem = ({ input, label, type, stackedLabel , meta: { touched, error, warning } }) => {
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

export default FormItem