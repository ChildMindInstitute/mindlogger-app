import React, { useState, useRef } from "react";
import { StyleSheet, View, Image } from "react-native";
import Video from "react-native-video";
import MediaControls, { PLAYER_STATES } from "react-native-media-controls";

const noop = () => {};

export const VideoPlayer = ({ uri, width, height, autoPlay = false, resizeMode = "cover" }) => {
  const videoPlayer = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paused, setPaused] = useState(!autoPlay);
  const [playerState, setPlayerState] = useState(autoPlay ? PLAYER_STATES.PLAYING : PLAYER_STATES.PAUSED);

  const onSeek = (seek) => {
    videoPlayer?.current.seek(seek);
  };

  const onPaused = (playerState) => {
    setPaused(!paused);
    setPlayerState(playerState);
  };

  const onReplay = () => {
    setPlayerState(PLAYER_STATES.PLAYING);
    videoPlayer?.current.seek(0);
  };

  const onProgress = (data) => {
    // Video Player will continue progress even if the video already ended
    if (!isLoading) {
      setCurrentTime(data.currentTime);
    }
  };

  const onLoad = (data) => {
    setDuration(data.duration);
    setIsLoading(false);
  };

  const onLoadStart = () => setIsLoading(true);

  const onEnd = () => {
    // Uncomment this line if you choose repeat=false in the video player
    setPlayerState(PLAYER_STATES.ENDED);
  };

  const onSeeking = (currentTime) => setCurrentTime(currentTime);

  return (
    <View style={{ ...styles.container, width, height }}>
      <Video
        onEnd={onEnd}
        onLoad={onLoad}
        onLoadStart={onLoadStart}
        onProgress={onProgress}
        paused={paused}
        ref={(ref) => (videoPlayer.current = ref)}
        resizeMode={resizeMode}
        source={{ uri }}
        style={styles.mediaPlayer}
        volume={1.0}
        repeat={false}
      />
      <MediaControls
        isFullScreen={isFullScreen}
        duration={duration}
        isLoading={isLoading}
        mainColor="orange"
        onFullScreen={noop}
        onPaused={onPaused}
        onReplay={onReplay}
        onSeek={onSeek}
        onSeeking={onSeeking}
        playerState={playerState}
        progress={currentTime}
      />
    </View>
  );
};

export const GifPlayer = ({ uri, width, height }) => {
  const [key, setKey] = useState(0);

  const replay = () => {
    setKey(key+1);
  };

  return (
    <View style={{ ...styles.container, width, height }}>
      <Image key={key} source={{ uri }} style={styles.image} />
      <MediaControls
        isFullScreen={false}
        duration={0}
        isLoading={false}
        mainColor="orange"
        onFullScreen={noop}
        onReplay={replay}
        playerState={PLAYER_STATES.ENDED}
        progress={0}
        sliderStyle={{
          containerStyle: {
            display: 'none'
          }
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    marginTop: 30,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
  },
  mediaPlayer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: "black",
  },
  image: {
    flex: 1,
    width: "100%",
    backgroundColor: "black",
    resizeMode: "contain",
  },
});
