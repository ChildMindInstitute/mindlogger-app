import React from "react";
import PropTypes from "prop-types";

import { StyleSheet, Image } from "react-native";
import { VideoPlayer, GifPlayer } from "../../components/core/VideoPlayer";
import Mimoza from "mimoza";

const styles = StyleSheet.create({
  image: {
    flex: 1,
    width: "100%",
    backgroundColor: "white",
    resizeMode: "contain",
  },
});

const ActivitySplash = ({ activity }) => {
  const uri = activity.splash.en;
  const mimeType = Mimoza.getMimeType(uri) || "";

  if (mimeType.startsWith("video/")) {
    return <VideoPlayer uri={uri} autoPlay resizeMode="contain" />;
  } else if (mimeType.includes('gif')) {
    return <GifPlayer uri={uri} />;
  } else {
    return <Image source={{ uri }} style={styles.image} />;
  }
};

ActivitySplash.propTypes = {
  activity: PropTypes.object.isRequired,
};

export default ActivitySplash;
