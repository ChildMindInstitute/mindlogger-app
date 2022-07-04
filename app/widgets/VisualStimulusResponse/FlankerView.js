import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  requireNativeComponent,
  UIManager,
  findNodeHandle
} from "react-native";
import { event } from "react-native-reanimated";

type Props = {
  endGame: Function
}

const COMPONENT_NAME = "FlankerView";
const RNFlankerView = requireNativeComponent('RCTFlankerView', FlankerView, {});

class FlankerView extends React.PureComponent<Props> {

    _endGame = (event) => {
      if (!this.props.endGame) {
        return;
      }

      this.props.endGame(event.nativeEvent);
    }

    render() {
        return (
          <RNFlankerView {...this.props} endGame={this._endGame}/>
        );
      }
}

export default FlankerView;