import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { View } from "react-native";
import MultiSelect from "react-native-multiple-select";
import { connect } from "react-redux";
import { currentScreenSelector } from "../state/responses/responses.selectors";
import { OptionalText } from "./OptionalText";
import _ from "lodash";

export const MultiDropdownScreen = (props) => {
  const { config, token, value = {}, currentScreen, onChange } = props;
  const { isOptionalText, isOptionalTextRequired } = config;

  const [orderedItems, setOrderedItems] = useState([]);
  const multiSelectRef = useRef();

  useEffect(() => {
    const itemList = [...config.itemList].map((item) => ({
      name: item.name.en + (token ? (item.value < 0 ? " (" + item.value + ")" : " (+" + item.value + ")") : ""),
      value: token ? item.name.en : item.value,
    }));
    if (config.randomizeOptions) {
      itemList.sort(() => Math.random() - 0.5);
    }
    setOrderedItems(itemList);
  }, [config.itemList, currentScreen, config.randomizeOptions]);

  const onSelectedItemsChange = (items) => {
    const answer = {
      ...value,
      value: items,
    };
    onChange(answer);
  };

  const handleComment = (itemValue) => {
    const answer = {
      ...value,
      text: itemValue,
    };
    onChange(answer);
  };

  const selectedItems = _.get(value, "value", []);

  return (
    <View style={{ alignItems: "stretch" }}>
      <MultiSelect
        ref={multiSelectRef}
        items={orderedItems}
        uniqueKey="value"
        displayKey="name"
        selectedItems={selectedItems}
        onSelectedItemsChange={onSelectedItemsChange}
        selectText="Select Options"
        searchInputPlaceholderText="Search options..."
        submitButtonText="OK"
        hideTags
        fixedHeight={true}
        styleItemsContainer={{
          maxHeight: 180,
        }}
        styleRowList={{
          paddingVertical: 5,
        }}
      />
      <View>{multiSelectRef.current && multiSelectRef.current.getSelectedItemsExt(selectedItems)}</View>
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

MultiDropdownScreen.defaultProps = {
  value: undefined,
};

MultiDropdownScreen.propTypes = {
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

MultiDropdownScreen.isValid = (value = [], { minValue = 1, maxValue = Infinity }) => {
  if (!value || value.length < minValue || value.length > maxValue) {
    return false;
  }
  return true;
};

export const MultiDropdown = connect(mapStateToProps)(MultiDropdownScreen);
