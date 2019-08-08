import Svg, {
  G,
  Path,
} from 'react-native-svg';

/* Use this if you are using Expo
import { Svg } from 'expo';
const { Circle, Rect } = Svg;
*/

import React from 'react';
import { View, StyleSheet } from 'react-native';
/* eslint-disable */
export default class SvgExample extends React.Component {
  render() {
    return (
      <View
        style={{position: 'absolute'}}>
        <Svg width={600} height={600} style={{ position: 'absolute' }}>
          <Path
            d="M416.8 207.8c44.4 54.7 96.9 103.8 97.1 156.4.3 52.6-51.7 108.6-111.4 130.3-59.7 21.7-127.1 9.1-171.9-23-44.9-32.1-67.2-83.7-74.3-133.4-7.1-49.7 1.1-97.5 27.6-148 26.4-50.6 71.3-103.8 111.8-100.4 40.5 3.4 76.7 63.5 121.1 118.1z"
            // fill="#FE840E"
            fill="#ffd4a8"
          />
        </Svg>

        <Svg width={600} height={600} style={{ position: 'absolute' }}>
          <G transform="translate(150,150)">
            <Path
              d="M135,-141.8C156.8,-113.1,143.9,-56.6,139.1,-4.8C134.2,46.9,137.5,93.8,115.6,119.6C93.8,145.5,46.9,150.2,8.4,141.9C-30.2,133.5,-60.3,112,-105.5,86.2C-150.7,60.3,-210.8,30.2,-229.9,-19.1C-249,-68.4,-227,-136.7,-181.9,-165.4C-136.7,-194,-68.4,-183,-5.9,-177.1C56.6,-171.2,113.1,-170.5,135,-141.8Z"
              // fill="#eb144c"
              fill="#fcaec3"
            />
          </G>
        </Svg>

        <Svg width={600} height={800} style={{ position: 'absolute' }}>
          <G transform="translate(200,450)">
            <Path
              d="M74.3,-115.2C99.1,-84.1,124.2,-66.3,136.5,-41.4C148.7,-16.4,148,15.8,141.6,49.2C135.1,82.6,122.8,117.4,98.2,133.7C73.7,150.1,36.8,148,-4.9,154.8C-46.6,161.5,-93.3,177,-120.2,161.5C-147.2,145.9,-154.4,99.2,-178.2,51.8C-201.9,4.4,-242.2,-43.7,-236,-81C-229.8,-118.4,-177.2,-144.9,-130.2,-168.8C-83.1,-192.7,-41.5,-213.8,-8.4,-202.2C24.7,-190.6,49.4,-146.3,74.3,-115.2Z"
              // fill="#7bdcb5"
              fill="#baf5dd"
            />
          </G>
        </Svg>
      </View>
    );
  }
}