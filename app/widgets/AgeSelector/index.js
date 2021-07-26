import React from 'react';
import PropTypes from 'prop-types';
import { Text, Container, ListItem, Left, Right, Icon } from 'native-base';
import { Picker, Modal, StyleSheet, View } from 'react-native';
import { OptionalText } from '../OptionalText';
import i18n from 'i18next';

import { colors } from '../../theme';

const styles = StyleSheet.create({
  paddingContent: {
    flex: 1,
    borderTopWidth: 2,
    borderTopColor: colors.grey,
    justifyContent: 'flex-start',
  },
  label: {
    fontSize: 13,
    color: colors.grey,
  },
});

export class AgeSelector extends React.Component {
  finalAnswer = {};
  state = {
    modalVisible: false,
  };

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      this.setState({ modalVisible: false });
    }
  }

  handleComment = (itemValue) => {
    const { onChange } = this.props;
    this.finalAnswer["text"] = itemValue;
    onChange(this.finalAnswer);
  }

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  onSelect(v) {
    const { onChange } = this.props;
    onChange({ value: v });
  }

  render() {
    const { onChange, value, config, isOptionalText, isOptionalTextRequired } = this.props;
    let itemList = [];

    console.log('value: ', value);

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
        {this.state.modalVisible ? (
          <Container style={styles.paddingContent}>
            <Picker selectedValue={value?.value} onValueChange={(v) => onChange({ value: v })}>

              {itemList.map((item, index) => (
                <Picker.Item label={item} value={item} key={index} />
              ))}
            </Picker>
          </Container>
        ) : (
            <ListItem
              onPress={() => {
                this.setModalVisible(true);
              }}
            >
              <Left>
                <Text>{value ? value.value : i18n.t('select:select_one')}</Text>
              </Left>
              <Right>
                <Icon name="arrow-forward" />
              </Right>
            </ListItem>
          )}
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
