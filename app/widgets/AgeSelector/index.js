import React from 'react';
import PropTypes from 'prop-types';
import { Text, Container, ListItem, Left, Right, Icon } from 'native-base';
import { Modal, StyleSheet, View } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown'
import { OptionalText } from '../OptionalText';
import i18n from 'i18next';

import { colors } from '../../theme';

const styles = StyleSheet.create({
  paddingContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  dropDown: {
    backgroundColor: 'white',
    borderBottomWidth: 1.5,
    borderBottomColor: colors.lightGrey,
    color: 'white',
    
  },
  buttonStyle: {
    fontSize: 13,
    width: '100%',
    backgroundColor: 'transparent',
    borderBottomWidth: 1.5,
    borderBottomColor: colors.grey,
    color: colors.grey,
  },
  label: {
    fontSize: 13,
    color: colors.grey,
  },
});

export class AgeSelector extends React.Component {
  finalAnswer = {};

  handleComment = (itemValue) => {
    const { onChange } = this.props;
    this.finalAnswer["text"] = itemValue;
    onChange(this.finalAnswer);
  }

  onSelect(v) {
    const { onChange } = this.props;
    onChange({ value: v });
  }

  render() {
    const { onChange, value, config, isOptionalText, isOptionalTextRequired } = this.props;
    let itemList = [];

    for (let i = config.minAge; i <= config.maxAge; i += 1) {
      itemList.push('' + i);
    }

    if (!itemList.length) {
      return (
        <View>
          <Text>{i18n.t('select:no_items')}</Text>
        </View>
      );
    }

    return (
      <View style={{ marginBottom: 0, height: 350 }}>
          <Container style={styles.paddingContent}>
            <SelectDropdown
              data={itemList}
              dropdownStyle={styles.dropDown}
              buttonStyle={styles.buttonStyle}
              defaultButtonText={i18n.t('select:select_one')}
              defaultValue={value ? value.value : i18n.t('select:select_one')}
              onSelect={(selectedItem) => {
                onChange({ value: selectedItem })
              }}
              buttonTextAfterSelection={() => value ? value.value : i18n.t('select:select_one')}
              rowTextForSelection={(item) => item}
            />
          </Container>

        {isOptionalText &&
          <OptionalText
            onChangeText={text => this.handleComment(text)}
            value={this.finalAnswer["text"]}
            isRequired={isOptionalTextRequired}
          />
        }
      </View>
    );
  }
}

AgeSelector.defaultProps = {
  value: undefined,
};

AgeSelector.propTypes = {
  onChange: PropTypes.func.isRequired,
  isOptionalText: PropTypes.bool,
  isOptionalTextRequired: PropTypes.bool,
  value: PropTypes.any,
  config: PropTypes.object.isRequired,
};
