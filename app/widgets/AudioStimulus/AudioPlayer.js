import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import PropTypes from "prop-types";
import { Icon } from "native-base";
import { Player } from "@react-native-community/audio-toolkit";
import { colors } from "../../themes/colors";
import BaseText from "../../components/base_text/base_text";

const styles = StyleSheet.create({
  playButton: {
    borderRadius: 3,
    backgroundColor: colors.primary,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: 160,
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 1,
  },
  buttonText: {
    fontWeight: "bold",
    color: "white",
    fontSize: 18,
    marginLeft: 5,
    marginRight: 5,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    color: colors.tertiary,
    fontSize: 16,
  },
});

export class AudioPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playing: false,
      player: null,
      playbackCount: 0,
    };
  }
  play = () => {
    const { source, onEnd } = this.props;
    const { playbackCount } = this.state;
    const p = new Player(source);
    p.play();
    this.setState({
      player: p,
      playing: true,
      playbackCount: playbackCount + 1,
    });

    // Listen for end of track
    p.on("ended", () => {
      this.setState({ playing: false });
      onEnd();
    });
  };
  stop = () => {
    const { player } = this.state;
    this.setState({ playing: false });
    if (player) {
      player.stop();
    }
  };

  reset = () => {
    const { player, playing } = this.state;
    if (player && playing) {
      player.stop();
    }
    this.setState({
      player: null,
      playing: false,
      playbackCount: 0,
    });
  };

  render() {
    const { allowReplay } = this.props;
    const { playing, playbackCount } = this.state;
    if (playing && allowReplay) {
      return (
        <TouchableOpacity onPress={this.stop}>
          <View style={styles.playButton}>
            <BaseText style={styles.buttonText} textKey="audio_player:stop" />
            <Icon style={styles.buttonText} type="FontAwesome" name="stop" />
            {/* <Text>{elapsed}</Text> */}
          </View>
        </TouchableOpacity>
      );
    }

    if (playing) {
      return (
        <TouchableOpacity disabled>
          <View style={[styles.playButton, { opacity: 0.5 }]}>
            <BaseText
              style={styles.buttonText}
              textKey="audio_player:playing"
            />
            <Icon
              style={styles.buttonText}
              type="FontAwesome"
              name="volume-up"
            />
          </View>
        </TouchableOpacity>
      );
    }

    if (playbackCount === 0 || allowReplay) {
      return (
        <TouchableOpacity onPress={this.play}>
          <View style={styles.playButton}>
            <BaseText style={styles.buttonText} textKey="audio_player:play" />
            <Icon style={styles.buttonText} type="FontAwesome" name="play" />
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity disabled>
        <View style={[styles.playButton, { opacity: 0.5 }]}>
          <BaseText style={styles.buttonText} textKey="audio_player:play" />
          <Icon style={styles.buttonText} type="FontAwesome" name="check" />
        </View>
      </TouchableOpacity>
    );
  }
}

AudioPlayer.defaultProps = {
  allowReplay: true,
  onEnd: undefined,
};

AudioPlayer.propTypes = {
  source: PropTypes.string.isRequired,
  allowReplay: PropTypes.bool,
  onEnd: PropTypes.func,
};
