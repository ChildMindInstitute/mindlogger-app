import React, { Component } from "react";
import { View, Image , ScrollView,KeyboardAvoidingView, TextInput, Platform} from "react-native";
import PropTypes from "prop-types";
import * as R from "ramda";
import { ListItem, Text, Icon ,Item , Input } from 'native-base';
import { CheckBox } from 'react-native-elements';
import { getURL } from "../services/helper";
import { colors } from "../themes/colors";
import { TooltipBox } from './TooltipBox';
import i18n from 'i18next';
import { connect } from "react-redux";
import {
  currentScreenSelector,
} from "../state/responses/responses.selectors";

export class MultiSelectScreen extends Component {
  constructor() {
    super();
    this.state = {
      orderedItems: []
    };
  }
  static isValid(value = [], { minValue = 1, maxValue = Infinity }) {
    if (!value || value.length < minValue || value.length > maxValue) {
      return false;
    }
    return true;
  }
  finalAnswer = {};

  componentDidMount() {
    if (this.props.config.randomizeOptions) {
      this.setState({
        orderedItems: [...this.props.config.itemList].sort(() => Math.random() - 0.5)
      })
    } else {
      this.setState({
        orderedItems: this.props.config.itemList
      });
    }
  }

  componentDidUpdate(oldProps) {
    if (oldProps.currentScreen !== this.props.currentScreen && this.props.config.randomizeOptions) {
      this.setState({
        orderedItems: [...this.props.config.itemList].sort(() => Math.random() - 0.5)
      })
    }
  }

  onAnswer = (itemVal) => {
    const { onChange, config } = this.props;
    if (!this.finalAnswer["value"]  || (config.maxValue === 1 && config.minValue === 1)) {
      this.finalAnswer["value"] =[itemVal]
      onChange(this.finalAnswer);
    } else if (Array.isArray(this.finalAnswer["value"] ) && this.finalAnswer["value"] .includes(itemVal)) {
      const answerIndex = this.finalAnswer["value"] .indexOf(itemVal);
      this.finalAnswer["value"] =R.remove(answerIndex, 1, this.finalAnswer["value"] );
      onChange(this.finalAnswer);
    } else {
      this.finalAnswer["value"] =R.append(itemVal, this.finalAnswer["value"] );
      onChange(this.finalAnswer);
    }
  };

  handleComment = (itemValue) => {
    const {onChange} = this.props;
    this.finalAnswer["text"] = itemValue;
    onChange(this.finalAnswer);
  }

  render() {
    const {
      config: { itemList , isOptionalText, isOptionalTextRequired},
      token,
      value = {},
    } = this.props;

   this.finalAnswer = value ? value : {};

    return (
      <KeyboardAvoidingView
    //  behavior="padding"
    >
      <View style={{ alignItems: "stretch" }}>
        {this.state.orderedItems.map((item, index) => (
          <ListItem
            style={{ width: "90%" }}
            onPress={() => this.onAnswer(token ? item.name.en : item.value)}
            key={index}
          >
            <View style={{ width: '8%' }}>
              {item.description ? (
                <TooltipBox text={item.description}>
                  <Icon type="FontAwesome" name="question-circle" style={{color: '#016fbe', fontSize: 24, marginHorizontal: 0}} />
                </TooltipBox>
              ) : (
                <View />
              )}
            </View>
            <View style={{ width: "85%" }}>
              <View style={{ width: "100%", flexDirection: "row" }}>
                {item.image ? (
                  <Image
                    style={{ width: "20%", height: 64, resizeMode: "contain" }}
                    source={{ uri: getURL(item.image) }}
                  />
                ) : (
                  <View />
                )}
                {item.image ? (
                  <View
                    style={{
                      marginLeft: "8%",
                      maxWidth: "72%",
                      justifyContent: "center",
                    }}
                  >
                    <Text>
                      {item.name.en}{" "}
                      {token
                        ? item.value < 0
                          ? "(" + item.value + ")"
                          : "(+" + item.value + ")"
                        : ""}
                    </Text>
                  </View>
                ) : (
                  <View
                    style={{
                      marginLeft: "8%",
                      maxWidth: "92%",
                      justifyContent: "center",
                    }}
                  >
                    <Text>
                      {item.name.en}{" "}
                      {token
                        ? item.value < 0
                          ? "(" + item.value + ")"
                          : "(+" + item.value + ")"
                        : ""}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <View style={{ width: "15%" }}>
              <CheckBox
                checked={
                  this.finalAnswer["value"] &&
                  Array.isArray(this.finalAnswer["value"]) &&
                  this.finalAnswer["value"].includes(token ? item.name.en : item.value)
                }
                onPress={() => this.onAnswer(token ? item.name.en : item.value)}
                checkedIcon="check-square"
                uncheckedIcon="square-o"
                checkedColor={colors.primary}
                uncheckedColor={colors.primary}
              />
            </View>
          </ListItem>
        ))}

        {isOptionalText ?
          (<View style={{
            marginTop: '8%' ,
            width: '100%' ,
          }}
          >
        <Item bordered
          style={{borderWidth: 1}}
        >
          <TextInput
              style={{
                width: '100%',
                ... Platform.OS !== 'ios' ? {} : { maxHeight: 100, minHeight: 40 }
              }}
              placeholder = {
                i18n.t(isOptionalTextRequired ? 'optional_text:required' : 'optional_text:enter_text')
              }
              onChangeText={text=>this.handleComment(text)}
              value={this.finalAnswer["text"]}
              multiline={true}
          />
        </Item>
      </View>
    ):<View></View>
      }
      </View>
      </KeyboardAvoidingView>
    );
  }
}

MultiSelectScreen.defaultProps = {
  value: undefined,
};

MultiSelectScreen.propTypes = {
  config: PropTypes.shape({
    itemList: PropTypes.array,
    minValue: PropTypes.number,
    maxValue: PropTypes.number,
  }).isRequired,
  token: PropTypes.bool,
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  currentScreen: currentScreenSelector(state),
});

export const MultiSelect = connect(mapStateToProps)(MultiSelectScreen);
