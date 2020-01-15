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

// eslint-disable-next-line max-len
const AppletImage = ({ applet, size = 64, footerText = false, border = false, selected = false }) => {
  // Display the image if there is one
  if (typeof applet.image !== 'undefined') {
    return (
      <View style={{
        width: size,
      }}
      >
        <CachedImage
          style={{ width: size, height: size, resizeMode: 'cover' }}
          source={{ uri: getURL(applet.image) }}
        />
        {footerText && (
          <Text numberOfLines={1} style={{ fontSize: 10, marginTop: 5 }}>{applet.name.en}</Text>
        )}
      </View>
    );
  }

  // Default to showing the first letter of the applet name
  const firstLetter = applet.name.en[0].toUpperCase();
  const circleCx = border ? size / 2 - 4 : size / 2;
  return (
    <View style={{
      width: border ? size + 10 : size,
      backgroundColor: selected ? '#dff1fd' : '#fff',
      padding: border ? 5 : 0,
    }}
    >
      <View
        style={{
          width: size,
          height: size,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: border ? 1 : 0,
          borderColor: '#F00',
          borderRadius: size,
          // backgroundColor: 'rgb(100, 200, 150)',
        }}
      >
        <Svg height={size} width={size} style={{ position: 'absolute', left: border ? 3 : 0, top: border ? 3 : 0 }}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2={size} y2={size}>
              <Stop offset="0" stopColor="#24A3FF" stopOpacity="1" />
              <Stop offset="1" stopColor="#35FDB5" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Circle cx={circleCx} cy={circleCx} r={circleCx} fill="url(#grad)" />
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
      {footerText && (
        <Text numberOfLines={1} style={{ fontSize: 10, marginTop: 5 }}>{applet.name.en}</Text>
      )}
    </View>
  );
};

AppletImage.defaultProps = {
  size: 64,
  footerText: false,
  border: false,
  selected: false,
};

AppletImage.propTypes = {
  applet: PropTypes.object.isRequired,
  size: PropTypes.number,
  border: PropTypes.bool,
  footerText: PropTypes.bool,
  selected: PropTypes.bool,
};

export default AppletImage;
