import React from 'react';
import PropTypes from 'prop-types';
import { Button, Text, Container, ListItem, Left, Right, Icon } from 'native-base';
import { Picker, Modal, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

const styles = StyleSheet.create({
  paddingContent: {
    padding: 20,
    flexGrow: 1,
  },
  datePickerContainer: {
    flexGrow: 1,
    justifyContent: 'center',
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
          transparent={false}
          visible={this.state.modalVisible}
        >
          <Container style={styles.paddingContent}>
            <Container style={styles.datePickerContainer}>
              <Picker
                selectedValue={value}
                onValueChange={onChange}
              >
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
            <Button
              full
              style={styles.okButton}
              onPress={() => {
                this.setModalVisible(false);
              }}
            >
              <Text>OK</Text>
            </Button>
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
