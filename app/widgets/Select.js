import React from 'react';
import PropTypes from 'prop-types';
import { Text, Container, ListItem, Left, Right, Icon } from 'native-base';
import { Picker, Modal, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

const styles = StyleSheet.create({
  paddingContent: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '40%',
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

  render() {
    const { onChange, value, config } = this.props;

    if (typeof config.itemList === 'undefined') {
      return (
        <View>
          <Text>No items</Text>
        </View>
      );
    }

    const selectedItem = config.itemList.find(item => item.value === value);
    return (
      <View style={{ marginBottom: 20 }}>
        <ListItem
          onPress={() => {
            this.setModalVisible(true);
          }}
        >
          <Left>
            <Text>{selectedItem ? selectedItem.name.en : 'Select one'}</Text>
          </Left>
          <Right>
            <Icon name="arrow-forward" />
          </Right>
        </ListItem>
        <Modal
          animationType="slide"
          transparent
          visible={this.state.modalVisible}
        >
          <Container style={styles.paddingContent}>
            <Picker
              selectedValue={value}
              onValueChange={onChange}
            >
              <Picker.Item
                label="Select one"
                value={config.itemList[0].value}
              />
              {
                config.itemList.map((item, index) => (
                  <Picker.Item
                    label={item.name.en}
                    value={item.value}
                    key={index}
                  />
                ))
              }
            </Picker>
          </Container>
        </Modal>
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
