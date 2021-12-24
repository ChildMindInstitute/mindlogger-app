import React from "react";

import PropTypes from 'prop-types';
import { View, Image } from 'react-native';
import BaseText from "../../base_text/base_text";

const coin = require('../../../../img/coin.png');
const coins = require('../../../../img/coins.png');

const TokenHeader = (props) => {
  const { textColor, cumulative, tokensYesterday } = props;

  return (
    <View style={{ marginVertical: 20 }}>
      <BaseText
        style={{
          fontSize: 20,
          color: 'black',
          fontWeight: '500',
        }}
        value={'You have earned:'}
      />

      <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'flex-end' }}>
        <Image source={coins} style={{ width: 50, height: 50 }} />
        <BaseText
          style={{
            fontSize: 35,
            marginHorizontal: 5,
            color: textColor,
            fontWeight: '500'
          }}
        >{cumulative.toLocaleString()}</BaseText>

        <BaseText
          style={{
            fontSize: 20,
            marginBottom: 5,
            color: textColor,
            fontWeight: '500'
          }}
        >total</BaseText>
      </View>

      <View style={{ flexDirection: 'row', marginLeft: 15, alignItems: 'flex-end' }}>
        <Image source={coin} style={{ width: 25, height: 25 }} />
        <BaseText
          style={{
            fontSize: 20,
            color: textColor,
            fontWeight: '500',
            marginHorizontal: 2
          }}
        >{tokensYesterday.toLocaleString()}</BaseText>
        <BaseText
          style={{
            fontSize: 15,
            color: textColor,
            fontWeight: '500'
          }}
        >yesterday</BaseText>
      </View>
    </View>
  );
};

TokenHeader.propTypes = {
  textColor: PropTypes.string.isRequired,
  cumulative: PropTypes.number.isRequired,
  tokensYesterday: PropTypes.number.isRequired,
};

export default TokenHeader;
