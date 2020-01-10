import React from 'react';
import PropTypes from 'prop-types';
import { Button, Text, Container, ListItem, Left, Right, Icon } from 'native-base';
import { DatePickerIOS, Modal, StyleSheet, View } from 'react-native';
import moment from 'moment';
import { colors } from '../../theme';

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

export class DatePicker extends React.Component {
  state = {
    modalVisible: false,
  };

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  render() {
    const { onChange, value } = this.props;
    const date = value ? new Date(value.year, value.month, value.day) : new Date();
    return (
      <View style={{ marginBottom: 20 }}>
        <ListItem
          onPress={() => {
            this.setModalVisible(true);
          }}
        >
          <Left>
            <Text>{moment(date).format('LL')}</Text>
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
              <DatePickerIOS
                date={date}
                onDateChange={(date) => {
                  onChange({
                    year: date.getFullYear(),
                    month: date.getMonth(),
                    day: date.getDate(),
                  });
                }}
                mode="date"
              />
            </Container>
            <Button
              full
              style={styles.okButton}
              onPress={() => {
                onChange({
                  year: date.getFullYear(),
                  month: date.getMonth(),
                  day: date.getDate(),
                });
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

DatePicker.defaultProps = {
  value: undefined,
};

DatePicker.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.shape({
    year: PropTypes.number,
    month: PropTypes.number,
    day: PropTypes.number,
  }),
};
