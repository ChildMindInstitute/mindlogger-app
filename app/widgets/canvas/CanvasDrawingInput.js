import React, { Component } from "react";
import { StyleSheet } from "react-native";
import { Text, View } from "native-base";
import DrawingBoard from "../../components/drawing/DrawingBoard";
import CameraInput from "./CameraInput";

const styles = StyleSheet.create({
  board: {},
  text: {
    padding: 20
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 15
  },
  buttonText: {
    width: 68,
    textAlign: "center"
  },
  camera: {
    width: "100%",
    height: 360,
    position: "relative"
  }
});

export default class CanvasDrawingInput extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.setState({ drawing: this.props.config, duration: 0, started: true });
  }

  componentDidMount() {
    //this._play()
  }

  toggleSpinner = (show = true) => {
    this.setState({ spinner: show });
  };

  renderTimer() {
    const { duration, drawing } = this.state;
  }

  onBegin = () => {
    const { drawing } = this.state;
    this.board.start();
    this.setState({ started: true, duration: 0 });
    if (drawing.timer && drawing.timer > 0) this.startTimer();
  };

  startTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
    this.timerId = setInterval(() => {
      this.setState({ duration: this.state.duration + 1 });
      if (this.state.duration >= this.state.drawing.timer) {
        clearInterval(this.timerId);
        this.timerId = undefined;
        this.board.stop();
      }
    }, 1000);
  }

  resetData = () => {
    if(this.board) {
      this.board.reset();
    } else if (this.cameraRef) {

    }

  };

  onPicChange = (picSource) => {
    const {answer, onChange} = this.props;
    onChange({...answer, ...picSource});
  }
  onDrawingChange = (drawing) => {
    const {answer, onChange} = this.props;
    onChange({...answer, ...drawing});
  }

  take = () => {
    this.cameraRef.take();
  }

  render() {
    const { started } = this.state;
    const { onChange, video, config, answer } = this.props;
    //let timeStr = zeroFill(Math.floor(duration/60), 2) + ':' + zeroFill(Math.floor(duration%60), 2);
    if (config.mode == "camera") {
      if (!answer || !answer.uri) {
        return (
          <CameraInput
            video={video}
            config={config}
            answer={answer}
            onChange={this.onPicChange}
            ref={ref => {this.cameraRef = ref}}
          />)
      } else {
        return (
          <View><DrawingBoard
            source={answer}
            autoStart={true}
            disabled={false}
            lines={answer && answer.lines}
            ref={board => (this.board = board)}
            onResult={this.onDrawingChange}
          />
          {config.instruction && (
            <Text style={styles.text}>{config.instruction}</Text>
          )}</View>)
      }
    } else {
      return (
        <View>
          <DrawingBoard
            sourceFiles={config.mode == "picture" && config.pictureFiles}
            autoStart={true}
            disabled={!started}
            lines={answer && answer.lines}
            ref={board => (this.board = board)}
            onResult={onChange}
          />
          {config.instruction && (
            <Text style={styles.text}>{config.instruction}</Text>
          )}
        </View>
      );
    }
  }
}
