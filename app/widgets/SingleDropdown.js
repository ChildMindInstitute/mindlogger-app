import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { StyleSheet, View } from "react-native";
import { Container } from "native-base";
import SelectDropdown from "react-native-select-dropdown";
import { connect } from "react-redux";
import i18n from "i18next";
import _ from "lodash";

import { currentScreenSelector } from "../state/responses/responses.selectors";
import { OptionalText } from "./OptionalText";
import { colors } from "../theme";

const styles = StyleSheet.create({
  paddingContent: {
    flex: 1,
    justifyContent: "flex-start",
  },
  dropDown: {
    backgroundColor: "transparent",
    borderBottomWidth: 1.5,
    borderBottomColor: colors.lightGrey,
    color: "white",
  },
  buttonStyle: {
    fontSize: 13,
    width: "100%",
    backgroundColor: "transparent",
    borderBottomWidth: 1.5,
    borderBottomColor: colors.grey,
    color: colors.grey,
  },
  label: {
    fontSize: 13,
    color: colors.grey,
  },
});

export const SingleDropdownScreen = ({ value, config, onChange, token, selected, onSelected, currentScreen }) => {
  const { isOptionalText, isOptionalTextRequired } = config;
  let finalAnswer = value ? value : {};

  const shuffle = (list) => {
    return [...list].sort(() => Math.random() - 0.5);
  };

  const computedList = (itemList) =>
    itemList.map((item) => ({
      ...item,
      label: item.name.en + " " + (token ? (item.value < 0 ? "(" + item.value + ")" : "(+" + item.value + ")") : ""),
    }));

  const [itemOrder, setItemOrder] = useState(
    computedList(config.randomizeOptions ? shuffle(config.itemList) : config.itemList)
  );

  useEffect(() => {
    if (config.randomizeOptions) {
      setItemOrder(computedList(shuffle(config.itemList)));
    }
  }, [currentScreen]);

  const handleSelect = (item) => {
    finalAnswer["value"] = token ? item.name.en : item.value;
    onSelected(true);
    onChange(finalAnswer);
  };

  const handleComment = (itemValue) => {
    finalAnswer["text"] = itemValue;
    onChange(finalAnswer);
  };

  const selectedItem = itemOrder.find((item) => (token ? item.name.en : item.value) == finalAnswer["value"]);

  return (
    <View style={{ marginBottom: 0, height: 350 }}>
      <Container style={styles.paddingContent}>
        <SelectDropdown
          data={itemOrder}
          dropdownStyle={styles.dropDown}
          buttonStyle={styles.buttonStyle}
          defaultButtonText={i18n.t("select:select_one")}
          defaultValue={selectedItem}
          onSelect={(item) => handleSelect(item)}
          buttonTextAfterSelection={(item) => item.label}
          rowTextForSelection={(item) => item.label}
        />
      </Container>

      {isOptionalText && (
        <OptionalText
          isRequired={isOptionalTextRequired}
          value={_.get(value, "text")}
          onChangeText={(text) => handleComment(text)}
        />
      )}
    </View>
  );
};

SingleDropdownScreen.defaultProps = {
  value: undefined,
};

SingleDropdownScreen.propTypes = {
  value: PropTypes.any,
  config: PropTypes.shape({
    itemList: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.object,
        value: PropTypes.any,
        image: PropTypes.string,
      })
    ).isRequired,
  }).isRequired,
  onSelected: PropTypes.func.isRequired,
  token: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  currentScreen: currentScreenSelector(state),
});

export const SingleDropdown = connect(mapStateToProps)(SingleDropdownScreen);
