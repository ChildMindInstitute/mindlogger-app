import React from 'react';
import PropTypes from 'prop-types';
import { View, Text } from 'react-native';
import { CachedImage } from 'react-native-img-cache';

const AppletImage = ({ applet, size = 50 }) => {
  // Display the image if there is one
  if (typeof applet.image !== 'undefined') {
    return (
      <CachedImage
        style={{ width: size, height: size, resizeMode: 'cover' }}
        source={{ uri: applet.image.en }}
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
        backgroundColor: 'rgb(100, 200, 150)',
      }}
    >
      <Text
        style={{
          fontSize: size / 2,
          color: 'rgba(255, 255, 255, 0.5)',
          fontWeight: 'bold',
        }}
      >
        {firstLetter}
      </Text>
    </View>
  );
};

AppletImage.defaultProps = {
  size: 50,
};

AppletImage.propTypes = {
  applet: PropTypes.object.isRequired,
  size: PropTypes.number,
};

export default AppletImage;
