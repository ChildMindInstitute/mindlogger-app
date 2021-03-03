import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { Slider } from "../Slider";

const styles = StyleSheet.create({
  sliderContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderLabel: {
    width: "20%",
    fontSize: 15
  },
  sliderElement: {
    width: "80%"
  }
});

class StackedSlider extends Component {
  sliderRef = React.createRef();

  static propTypes = {
    config: PropTypes.shape({
      sliderOptions: PropTypes.array.isRequired,
    }).isRequired,
    appletName: PropTypes.string.isRequired,
    value: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    onPress: PropTypes.func,
    onRelease: PropTypes.func,
  };

  static defaultProps = {
    value: undefined,
    onPress: () => {},
    onRelease: () => {},
  };

  render() {
    const {
      config,
      appletName,
      onChange,
      onPress,
      onRelease,
    } = this.props;

    let currentValue = this.props.value;
    if (!currentValue) {
      currentValue = [];

      for (let i = 0; i < config.sliderOptions.length; i++) {
        currentValue.push(null);
      }
    }

    return (
        <View>
          {
            config.sliderOptions.map((slider, index) => (
              <View style={styles.sliderContainer}>
                <View style={styles.sliderLabel}>
                  <Text>
                    {slider.sliderLabel}
                  </Text>
                </View>
                <View
                  style={styles.sliderElement}
                >
                  <Slider
                    config={slider}
                    appletName={appletName}
                    onChange={(val) => {
                      currentValue[index] = {
                        value: Math.floor(val['value'])
                      };
                      onChange(currentValue);
                    }}
                    onPress={() => {
                      for (let i = 0; i < currentValue.length; i++) {
                        if (currentValue[i] === null) {
                          return ;
                        }
                      }
                      onPress();
                    }}
                    onRelease={onRelease}
                    value={currentValue[index]}
                  />
                </View>
              </View>
            ))
          }
        </View>
    )
  }
}

export { StackedSlider };
