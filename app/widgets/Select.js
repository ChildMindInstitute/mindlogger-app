import React from 'react';
import PropTypes from 'prop-types';
import { Text, Container, ListItem, Left, Right, Icon } from 'native-base';
import { Picker, Modal, StyleSheet, View } from 'react-native';
import i18n from 'i18next';

import { colors } from '../theme';

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

export class Select extends React.Component {
  state = {
    modalVisible: false,
  };

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      this.setState({ modalVisible: false });
    }
  }

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  onSelect(v) {
    const { onChange } = this.props;
    onChange({ value: v });
  }

  render() {
    const { onChange, value, config } = this.props;

    if (typeof config.itemList === 'undefined') {
      return (
        <View>
          <Text>{i18n.t('select:no_items')}</Text>
        </View>
      );
    }

    const selectedItem = config.itemList.find(item => item.value === (typeof value === 'object' ? value.value : value));

    return (
      <View style={{ marginBottom: 0, height: 350 }}>
        {this.state.modalVisible ? (
          <Container style={styles.paddingContent}>
            <Picker selectedValue={value} onValueChange={(v) => this.onSelect(v)}>
              <Picker.Item label="Select one" value={config.itemList[0].value} />
              {config.itemList.map((item, index) => (
                <Picker.Item label={item.name.en} value={item.value} key={index} />
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
                <Text>{selectedItem ? selectedItem.name.en : i18n.t('select:select_one')}</Text>
              </Left>
              <Right>
                <Icon name="arrow-forward" />
              </Right>
            </ListItem>
          )}
      </View>
    );
  }
}

Select.defaultProps = {
  value: undefined,
};

Select.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
  config: PropTypes.object.isRequired,
};
