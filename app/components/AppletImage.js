import React from 'react';
import PropTypes from 'prop-types';
import { View, Text } from 'react-native';
import { CachedImage } from 'react-native-img-cache';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

const getURL = (url) => {
  if (url.endsWith('.svg')) {
    return url.replace('.svg', '.jpg');
  }
  return url;
};

const AppletImage = ({ applet, size = 64 }) => {
  // Display the image if there is one
  if (typeof applet.image !== 'undefined' && applet.image.en) {
    return (
      <CachedImage
        style={{ width: size, height: size, resizeMode: 'cover' }}
        source={{ uri: getURL(applet.image.en) }}
      />
    );
  }

  // Default to showing the first letter of the applet name
  const firstLetter = applet.name.en[0].toUpperCase();
  return (
    <View
      style={{
        width: size,
        height: size,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'rgb(100, 200, 150)',
      }}
    >
      <Svg height={size} width={size} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2={size} y2={size}>
            <Stop offset="0" stopColor="#24A3FF" stopOpacity="1" />
            <Stop offset="1" stopColor="#35FDB5" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#grad)" />
      </Svg>

      <Text
        style={{
          fontSize: size / 2,
          color: 'rgba(255, 255, 255, 0.8)',
          fontWeight: 'bold',
        }}
      >
        {firstLetter}
      </Text>
    </View>
  );
};

AppletImage.defaultProps = {
  size: 64,
};

AppletImage.propTypes = {
  applet: PropTypes.object.isRequired,
  size: PropTypes.number,
};

export default AppletImage;
